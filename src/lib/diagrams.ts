import { generateTablature } from '@/lib/api';

const cache = new Map<string, string[]>();

/** Guitar shapes from the API's tablature diagrams (high e first), cached for the session. */
export async function getDiagrams(chords: string[]): Promise<Record<string, string[]>> {
  const missing = Array.from(new Set(chords.filter((chord) => !cache.has(chord))));
  if (missing.length) {
    const response = await generateTablature('diagramas', missing);
    response.diagrams.forEach((diagram) => cache.set(diagram.chord, diagram.frets));
  }
  return Object.fromEntries(chords.filter((chord) => cache.has(chord)).map((chord) => [chord, cache.get(chord)!]));
}
