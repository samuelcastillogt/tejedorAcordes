import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { GuitarDiagram } from '@/components/guitar-diagram';
import { PianoKeys } from '@/components/piano-keys';
import { Button, Label } from '@/components/ui';
import { color, font } from '@/constants/theme';
import { usePlayback } from '@/lib/audio/playback';
import { useCatalog } from '@/lib/catalog';
import { getDiagrams } from '@/lib/diagrams';
import { chordRoot, displayChord, LATIN_NAMES } from '@/lib/music/theory';

/** How to play a chord: guitar shape, piano keys, its notes and a button to hear it. */
export function ChordDetail({ chord, latin, accent = color.night, capo = 0, shape }: { chord: string; latin: boolean; accent?: string; capo?: number; shape?: string }) {
  const { byId, notesOf } = useCatalog();
  const playback = usePlayback();
  // With a capo, the hand plays another shape (e.g. G shape with capo 2 sounds A).
  const shapeChord = shape ?? chord;
  // Keyed by chord, so a previous chord's diagram is never shown while the next one loads.
  const [loaded, setLoaded] = useState<{ chord: string; frets: string[] | null; error: boolean } | null>(null);
  const frets = loaded?.chord === shapeChord ? loaded.frets : null;
  const diagramError = loaded?.chord === shapeChord && loaded.error;

  useEffect(() => {
    let cancelled = false;
    getDiagrams([shapeChord])
      .then((diagrams) => !cancelled && setLoaded({ chord: shapeChord, frets: diagrams[shapeChord] ?? null, error: false }))
      .catch(() => !cancelled && setLoaded({ chord: shapeChord, frets: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [shapeChord]);

  const notes = notesOf(chord);
  const info = byId.get(chord);
  const playing = playback.playingId === `chord:${chord}`;
  const noteNames = notes.map((note) => (latin ? LATIN_NAMES[note] : note));

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text selectable style={{ color: color.ink, fontFamily: font.monoBold, fontSize: 40 }}>
            {displayChord(chord, latin)}
          </Text>
          <Text style={{ color: color.inkMute, fontFamily: font.ui, fontSize: 14 }}>
            {info?.label ? `${displayChord(chordRoot(chord), latin)} ${info.label}` : ''}
            {noteNames.length ? ` · notas ${noteNames.join(' – ')}` : ''}
          </Text>
        </View>
        <Button
          label={playing ? 'Detener' : 'Escuchar'}
          icon={playing ? 'stop' : 'play'}
          variant="gold"
          pill
          disabled={!notes.length}
          onPress={() => (playing ? playback.stop() : void playback.play([notes], { id: `chord:${chord}` }))}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Label>{capo ? `Guitarra · forma de ${displayChord(shapeChord, latin)} con capo en ${capo}` : 'Guitarra'}</Label>
        <View style={{ alignItems: 'center', minHeight: 200, justifyContent: 'center' }}>
          {frets ? (
            <GuitarDiagram frets={frets} accent={accent} />
          ) : diagramError ? (
            <Text style={{ color: color.inkMute, fontFamily: font.ui }}>Sin conexión: no se pudo cargar el diagrama.</Text>
          ) : (
            <ActivityIndicator color={color.night} />
          )}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Label>Piano</Label>
        <PianoKeys notes={notes} root={notes[0]} accent={accent} />
      </View>
    </View>
  );
}
