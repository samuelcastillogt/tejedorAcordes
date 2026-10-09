import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, Chip } from '@/components/ui';
import { color, font } from '@/constants/theme';
import { chordRoot, CHROMATIC_NOTES, displayChord, LATIN_NAMES } from '@/lib/music/theory';

/** Qualities as catalog suffixes, in the order musicians reach for them. */
const QUALITIES: { suffix: string; label: string }[] = [
  { suffix: '', label: 'Mayor' },
  { suffix: 'm', label: 'm' },
  { suffix: '7', label: '7' },
  { suffix: 'maj7', label: 'maj7' },
  { suffix: 'm7', label: 'm7' },
  { suffix: 'sus4', label: 'sus4' },
  { suffix: 'sus2', label: 'sus2' },
  { suffix: 'add9', label: 'add9' },
  { suffix: 'dim', label: 'dim' },
  { suffix: 'm7b5', label: 'm7♭5' },
  { suffix: 'aug', label: 'aug' },
  { suffix: '6', label: '6' },
];

/** Root + quality picker: two taps to any of the 192 chords, without typing. */
export function ChordKeypad({
  onAdd,
  onChange,
  initial = 'C',
  latin,
  valid,
}: {
  /** Chord selected when the keypad mounts (remount with a new key to change it). */
  initial?: string;
  /** Shows an "Agregar" button; without it the keypad only reports the selection through onChange. */
  onAdd?: (chord: string) => void;
  onChange?: (chord: string) => void;
  latin: boolean;
  valid: (id: string) => boolean;
}) {
  const [root, setRootState] = useState(chordRoot(initial));
  const [suffix, setSuffixState] = useState(initial.slice(chordRoot(initial).length));
  const setRoot = (next: string) => {
    setRootState(next);
    if (valid(next + suffix)) onChange?.(next + suffix);
  };
  const setSuffix = (next: string) => {
    setSuffixState(next);
    if (valid(root + next)) onChange?.(root + next);
  };
  const chord = root + suffix;
  const ok = valid(chord);
  return (
    <View style={{ gap: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CHROMATIC_NOTES.map((note) => (
          <Chip key={note} label={latin ? LATIN_NAMES[note] : note} mono selected={root === note} onPress={() => setRoot(note)} accessibilityLabel={`Raíz ${note}`} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {QUALITIES.map((quality) => (
          <Chip key={quality.label} label={quality.label} selected={suffix === quality.suffix} onPress={() => setSuffix(quality.suffix)} accessibilityLabel={`Calidad ${quality.label}`} />
        ))}
      </ScrollView>
      {onAdd ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ flex: 1, color: color.ink, fontFamily: font.monoBold, fontSize: 26 }}>{displayChord(chord, latin)}</Text>
          <Button label="Agregar" icon="plus" onPress={() => onAdd(chord)} disabled={!ok} />
        </View>
      ) : !ok ? (
        <Text style={{ color: color.inkMute, fontFamily: font.ui, fontSize: 13 }}>Ese tipo de acorde no está en el catálogo.</Text>
      ) : null}
    </View>
  );
}
