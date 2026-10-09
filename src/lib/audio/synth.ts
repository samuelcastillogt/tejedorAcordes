/**
 * Renders chords to a WAV in memory: a soft plucked tone (a few decaying harmonics with a strum),
 * so playback works offline and needs no audio samples. Same voicing as the website's player.
 */
import { voiceChord } from '@/lib/music/theory';

const SAMPLE_RATE = 22050;
const STRUM_SECONDS = 0.022;
const HARMONICS = [1, 0.45, 0.22, 0.1];

export function chordSeconds(bpm: number, beatsPerChord = 2) {
  return (60 / bpm) * beatsPerChord;
}

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Mono 16-bit PCM samples for a sequence of chords (each chord = list of note names). */
export function renderChords(chordNotes: string[][], bpm = 100): Int16Array {
  const step = chordSeconds(bpm);
  const tail = 0.6;
  const total = Math.ceil((chordNotes.length * step + tail) * SAMPLE_RATE);
  const mix = new Float32Array(total);
  chordNotes.forEach((notes, chordIndex) => {
    const start = chordIndex * step;
    const ring = step + 0.35;
    voiceChord(notes).forEach((midi, voiceIndex) => {
      const frequency = midiToFrequency(midi);
      const offset = Math.floor((start + voiceIndex * STRUM_SECONDS) * SAMPLE_RATE);
      const length = Math.floor(ring * SAMPLE_RATE);
      const gain = voiceIndex === 0 ? 0.32 : 0.22;
      for (let i = 0; i < length && offset + i < total; i += 1) {
        const t = i / SAMPLE_RATE;
        const attack = Math.min(1, t / 0.006);
        // Fade out the last 80 ms so chords do not click when the next one starts.
        const release = Math.min(1, (ring - t) / 0.08);
        let sample = 0;
        for (let h = 0; h < HARMONICS.length; h += 1) {
          sample += HARMONICS[h] * Math.sin(2 * Math.PI * frequency * (h + 1) * t) * Math.exp(-t * (2.2 + h * 1.6));
        }
        mix[offset + i] += sample * gain * attack * release;
      }
    });
  });
  let peak = 0;
  for (let i = 0; i < total; i += 1) peak = Math.max(peak, Math.abs(mix[i]));
  const scale = peak > 0 ? 0.85 / peak : 0;
  const pcm = new Int16Array(total);
  for (let i = 0; i < total; i += 1) pcm[i] = Math.round(mix[i] * scale * 32767);
  return pcm;
}

/** A WAV file (RIFF header + PCM data). */
export function encodeWav(pcm: Int16Array): Uint8Array {
  const bytes = new Uint8Array(44 + pcm.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + pcm.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i += 1) view.setInt16(44 + i * 2, pcm[i], true);
  return bytes;
}
