import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { chordSeconds, encodeWav, renderChords } from '@/lib/audio/synth';

type PlayOptions = {
  /** Identifies what is playing (e.g. "progression" or a chord id) so its button can show "stop". */
  id: string;
  bpm?: number;
  loop?: boolean;
};

type PlaybackValue = {
  /** id of what is playing, or null. */
  playingId: string | null;
  /** Index of the chord sounding right now (for highlighting), or -1. */
  activeIndex: number;
  /** Why the last play failed, so the UI never fails silently. */
  error: string | null;
  play: (chordNotes: string[][], options: PlayOptions) => Promise<void>;
  stop: () => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

type Source = { uri: string; release: () => void };

/** Writes the WAV where the native player can read it (a blob URL on the web). */
function toSource(bytes: Uint8Array): Source {
  if (process.env.EXPO_OS === 'web') {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const uri = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    return { uri, release: () => URL.revokeObjectURL(uri) };
  }
  const file = new File(Paths.cache, `cw-${Date.now()}.wav`);
  file.create({ overwrite: true });
  file.write(bytes);
  return {
    uri: file.uri,
    release: () => {
      try {
        file.delete();
      } catch {
        // Already gone: nothing to clean up.
      }
    },
  };
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const player = useRef<AudioPlayer | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSource = useRef<Source | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chords are music: they should sound even with the iPhone's silent switch on.
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    return () => {
      if (timer.current) clearInterval(timer.current);
      player.current?.remove();
    };
  }, []);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    player.current?.pause();
    setPlayingId(null);
    setActiveIndex(-1);
  }, []);

  const play = useCallback(
    async (chordNotes: string[][], { id, bpm = 100, loop = false }: PlayOptions) => {
      stop();
      setError(null);
      if (!chordNotes.length || chordNotes.every((notes) => notes.length === 0)) {
        setError('Aún no tenemos las notas de estos acordes: revisa tu conexión.');
        return;
      }
      let source: Source;
      try {
        source = toSource(encodeWav(renderChords(chordNotes, bpm)));
      } catch (err) {
        setError(`No se pudo preparar el sonido (${err instanceof Error ? err.message : String(err)}).`);
        return;
      }
      let current: AudioPlayer;
      try {
        if (!player.current) player.current = createAudioPlayer(source.uri);
        else player.current.replace(source.uri);
        lastSource.current?.release();
        lastSource.current = source;
        current = player.current;
        current.loop = loop;
        await current.seekTo(0).catch(() => undefined);
        current.play();
      } catch (err) {
        setError(`No se pudo reproducir (${err instanceof Error ? err.message : String(err)}).`);
        return;
      }
      setPlayingId(id);
      setActiveIndex(0);
      const step = chordSeconds(bpm);
      const length = chordNotes.length * step + 0.6;
      timer.current = setInterval(() => {
        const position = current.currentTime % length;
        if (!loop && (!current.playing || current.currentTime >= length - 0.05) && current.currentTime > 0.2) {
          stop();
          return;
        }
        setActiveIndex(Math.min(chordNotes.length - 1, Math.floor(position / step)));
      }, 60);
    },
    [stop],
  );

  const value = useMemo(() => ({ playingId, activeIndex, error, play, stop }), [playingId, activeIndex, error, play, stop]);
  return <PlaybackContext value={value}>{children}</PlaybackContext>;
}

export function usePlayback(): PlaybackValue {
  const context = use(PlaybackContext);
  if (!context) throw new Error('usePlayback must be used inside PlaybackProvider');
  return context;
}
