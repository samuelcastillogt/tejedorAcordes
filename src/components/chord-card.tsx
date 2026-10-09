import { Pressable, Text } from 'react-native';

import { color, font, functionColor, functionLabel, radius } from '@/constants/theme';
import type { Degree } from '@/lib/api';
import { displayChord } from '@/lib/music/theory';
import type { Labels } from '@/lib/progression';

/**
 * A chord as on the web's analyzer: chord name in mono, roman numeral in Fraunces and a 5 px top
 * border in the colour of its harmonic function (grey until the progression is analysed).
 */
export function ChordCard({
  chord,
  degree,
  labels = 'chords',
  latin = false,
  active = false,
  onPress,
  onLongPress,
  width = 76,
}: {
  chord: string;
  degree?: Degree;
  labels?: Labels;
  latin?: boolean;
  active?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  width?: number;
}) {
  const accent = degree ? functionColor(degree.function, degree.role) : color.hairline;
  const name = displayChord(chord, latin);
  const primary = labels === 'numerals' && degree ? degree.numeral : name;
  const secondary = labels === 'numerals' && degree ? name : degree?.numeral;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}${degree ? `, ${degree.numeral}, ${functionLabel(degree.function, degree.role)}` : ''}`}
      accessibilityHint="Toca para escucharlo y ver opciones"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        width,
        minHeight: 84,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: active ? color.night : color.card,
        borderWidth: 1,
        borderColor: active ? color.night : color.hairline,
        borderTopWidth: 5,
        borderTopColor: accent,
        paddingHorizontal: 6,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        transform: [{ scale: pressed ? 0.96 : active ? 1.04 : 1 }],
      })}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          color: active ? color.onNight : labels === 'numerals' && degree ? accent : color.ink,
          fontFamily: labels === 'numerals' && degree ? font.display : font.monoBold,
          fontSize: labels === 'numerals' && degree ? 24 : 18,
        }}
      >
        {primary}
      </Text>
      {secondary ? (
        <Text numberOfLines={1} style={{ color: active ? color.onNightMute : labels === 'numerals' ? color.inkMute : accent, fontFamily: labels === 'numerals' ? font.mono : font.display, fontSize: labels === 'numerals' ? 12 : 16 }}>
          {secondary}
        </Text>
      ) : null}
    </Pressable>
  );
}
