/** Ranking of next-chord suggestions, ported from the website (chordsAppWeb/src/lib/music/suggestions.ts). */
import type { Connection } from '@/lib/api';

export type SuggestionMode = 'all' | 'safe' | 'interesting' | 'bold';

export const SUGGESTION_MODES: { id: SuggestionMode; label: string; hint: string }[] = [
  { id: 'all', label: 'Todas', hint: 'Todas las conexiones, de la más natural a la más tensa.' },
  { id: 'safe', label: 'Segura', hint: 'Cambios naturales que casi siempre funcionan.' },
  { id: 'interesting', label: 'Interesante', hint: 'Un poco de color sin perder el hilo.' },
  { id: 'bold', label: 'Atrevida', hint: 'Tensión y sorpresa: úsalas con intención.' },
];

const MODE_CATEGORIES: Record<SuggestionMode, Connection['category'][]> = {
  all: ['natural', 'media', 'tensa', 'extrema'],
  safe: ['natural'],
  interesting: ['media'],
  bold: ['tensa', 'extrema'],
};

export type RankedSuggestion = Connection & { explanation: string };

export function rankSuggestions(connections: Connection[], mode: SuggestionMode, limit = 16): RankedSuggestion[] {
  const allowed = MODE_CATEGORIES[mode];
  return connections
    .filter((connection) => allowed.includes(connection.category))
    .map((connection) => ({ ...connection, explanation: explainConnection(connection) }))
    .sort((a, b) => b.score - a.score || a.target.localeCompare(b.target))
    .slice(0, limit);
}

/** Short explanation: the details of the two criteria that weigh the most. */
export function explainConnection(connection: Connection): string {
  return Object.values(connection.breakdown ?? {})
    .filter((item) => item.weighted > 0 && item.detail)
    .sort((a, b) => b.weighted - a.weighted)
    .slice(0, 2)
    .map((item) => item.detail)
    .join(' · ');
}

/** Ready-made progressions for the empty state, as degrees in a key. */
export const PRESETS: { name: string; mood: string; chords: string[] }[] = [
  { name: 'Pop de cuatro acordes', mood: 'I – V – vi – IV', chords: ['C', 'G', 'Am', 'F'] },
  { name: 'Balada en menor', mood: 'i – VI – III – VII', chords: ['Bm', 'G', 'D', 'A'] },
  { name: 'Jazz: ii – V – I', mood: 'ii7 – V7 – Imaj7', chords: ['Dm7', 'G7', 'Cmaj7'] },
  { name: 'Cadencia andaluza', mood: 'i – VII – VI – V', chords: ['Am', 'G', 'F', 'E'] },
  { name: 'Alabanza', mood: 'I – IV – vi – V', chords: ['G', 'C', 'Em', 'D'] },
  { name: 'Blues', mood: 'I7 – IV7 – V7', chords: ['A7', 'D7', 'E7'] },
];
