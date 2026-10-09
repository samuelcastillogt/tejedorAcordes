/**
 * ChordWeaver's visual system, the same tokens as the website (chordsAppWeb/DESIGN.md):
 * "night" surfaces where you play and listen, "paper" surfaces where you read and understand.
 * Colour never decorates: it encodes harmonic function, identically on web and mobile.
 */
export const color = {
  night: '#16132a',
  nightDeep: '#0d0b1a',
  onNight: '#fbf7ef',
  onNightMute: '#c9c3da',
  hairlineNight: '#3a3555',
  gold: '#f2c14e',
  paper: '#f6f1e7',
  card: '#fffdf8',
  hairline: '#e7dfd0',
  ink: '#1f1b16',
  inkMute: '#6b645a',
  inkFaint: '#a39b8e',
  tealDeep: '#123b36',
  tealMid: '#1c5a52',
  danger: '#b42318',
  tonic: '#1f8a70',
  subdominant: '#c98a14',
  dominant: '#d4462b',
  borrowed: '#7b5cd6',
  chromatic: '#6b7280',
} as const;

/** Families loaded in the root layout (see src/app/_layout.tsx). */
export const font = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const radius = { sm: 8, md: 12, lg: 18, xl: 24 } as const;

export const shadow = { card: '0 1px 2px rgba(31, 27, 22, 0.06), 0 8px 24px rgba(31, 27, 22, 0.06)' } as const;

/** Engine categories of a chord change keep green / amber / orange / red; darker tones read on paper. */
export function categoryColor(category: string): string {
  if (category === 'natural') return '#1f8a4c';
  if (category === 'media') return '#a16207';
  if (category === 'tensa') return '#c2410c';
  return '#b91c1c';
}

export function categoryLabel(category: string): string {
  if (category === 'natural') return 'Natural';
  if (category === 'media') return 'Media';
  if (category === 'tensa') return 'Tensa';
  return 'Extrema';
}

/** Colour of a harmonic function (T / SD / D) or a non-diatonic role. Same values as the web. */
export function functionColor(fn: string | null, role?: string): string {
  if (role === 'borrowed') return color.borrowed;
  if (role === 'chromatic') return color.chromatic;
  if (fn === 'T') return color.tonic;
  if (fn === 'SD') return color.subdominant;
  if (fn === 'D') return color.dominant;
  return color.chromatic;
}

export function functionLabel(fn: string | null, role?: string): string {
  if (role === 'secondary_dominant') return 'Dominante secundaria';
  if (role === 'borrowed') return 'Prestado';
  if (role === 'chromatic') return 'Cromático';
  if (fn === 'T') return 'Tónica';
  if (fn === 'SD') return 'Subdominante';
  if (fn === 'D') return 'Dominante';
  return 'Color';
}
