/** Pitch helpers shared with the website (chordsAppWeb/src/lib/music/theory.ts). */

export const NOTE_OFFSETS: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

export const CHROMATIC_NOTES = Object.keys(NOTE_OFFSETS);

/** Latin names, as Spanish-speaking musicians read them. */
export const LATIN_NAMES: Record<string, string> = {
  C: 'Do',
  'C#': 'Do#',
  D: 'Re',
  'D#': 'Re#',
  E: 'Mi',
  F: 'Fa',
  'F#': 'Fa#',
  G: 'Sol',
  'G#': 'Sol#',
  A: 'La',
  'A#': 'La#',
  B: 'Si',
};

export function chordRoot(chordId: string): string {
  return chordId.length > 1 && chordId[1] === '#' ? chordId.slice(0, 2) : chordId.slice(0, 1);
}

/** Moves a chord id ("F#m7") by semitones, keeping its quality ("Gm7" for +1). */
export function transposeChord(chordId: string, semitones: number): string {
  const root = chordRoot(chordId);
  const offset = NOTE_OFFSETS[root];
  if (offset === undefined) return chordId;
  return CHROMATIC_NOTES[(((offset + semitones) % 12) + 12) % 12] + chordId.slice(root.length);
}

/** Splits free text ("Bm G D A", "C - G | Am, F", "Bm-G-D-A") into chord symbols. */
const CHORD_START_RE = /^([A-G]|DO|RE|MI|FA|SOL|LA|SI)/i;

export function splitChordInput(value: string): string[] {
  return value
    .split(/[\s,|;]+/)
    .flatMap((token) => {
      const parts = token.split('-').filter(Boolean);
      return parts.length > 1 && parts.every((part) => CHORD_START_RE.test(part)) ? parts : [token];
    })
    .map((token) => token.trim().replace(/^[[(]+|[\])]+$/g, ''))
    .filter((token) => token && token !== '-');
}

/** MIDI notes for a chord: root in octave 3 as the bass, upper notes stacked upward from octave 4. */
export function voiceChord(notes: string[]): number[] {
  const voiced: number[] = [];
  notes.forEach((note, index) => {
    const offset = NOTE_OFFSETS[note];
    if (offset === undefined) return;
    let midi = 12 * ((index === 0 ? 3 : 4) + 1) + offset;
    while (voiced.length > 1 && midi <= voiced[voiced.length - 1]) midi += 12;
    voiced.push(midi);
  });
  return voiced;
}

/** Chords of the catalog that contain every pressed note, the most complete first (reverse lookup). */
export function findChordsWithNotes<T extends { id: string; notes?: string[]; triad: string[] }>(catalog: T[], pressed: string[]) {
  const notes = Array.from(new Set(pressed));
  if (notes.length === 0) return [];
  return catalog
    .map((chord) => {
      const tones = new Set(chord.notes ?? chord.triad);
      const matched = notes.filter((note) => tones.has(note)).length;
      return { chord, coverage: matched / Math.max(tones.size, 1), exact: matched === notes.length && tones.size === notes.length };
    })
    .filter((item) => item.coverage > 0 && notes.every((note) => new Set(item.chord.notes ?? item.chord.triad).has(note)))
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.coverage - a.coverage || a.chord.id.length - b.chord.id.length);
}

/** Moves an item inside a list (reorder the progression). */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Chord id as the user reads it: "Bm" or, in Latin notation, "Sim". */
export function displayChord(chordId: string, latin = false): string {
  if (!latin) return chordId;
  const root = chordRoot(chordId);
  return (LATIN_NAMES[root] ?? root) + chordId.slice(root.length);
}
