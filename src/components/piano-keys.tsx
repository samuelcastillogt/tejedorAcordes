import { Pressable, Text, View } from 'react-native';

import { color, font } from '@/constants/theme';

const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
// Black keys sit on the boundary after these white keys (index in WHITE).
const BLACK: { note: string; after: number }[] = [
  { note: 'C#', after: 0 },
  { note: 'D#', after: 1 },
  { note: 'F#', after: 3 },
  { note: 'G#', after: 4 },
  { note: 'A#', after: 5 },
];
const BLACK_WIDTH = 0.6; // fraction of a white key

/**
 * One octave of piano keys. Highlights `notes`; with `onToggle` the keys can be tapped (reverse
 * lookup: "¿qué acorde es?"). The root gets the gold accent.
 */
export function PianoKeys({ notes, root, onToggle, accent = color.night, height = 120 }: { notes: string[]; root?: string; onToggle?: (note: string) => void; accent?: string; height?: number }) {
  const on = new Set(notes);
  // Night is almost the colour of a black key: pressed keys use the teal of the "save" actions instead.
  const highlight = accent === color.night ? color.tealMid : accent;
  const fill = (note: string) => (note === root ? color.gold : highlight);
  const whiteWidth = 100 / WHITE.length;
  return (
    <View style={{ height, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: color.hairline }} accessibilityLabel={`Piano: ${notes.join(', ') || 'sin notas'}`}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {WHITE.map((note) => (
          <Pressable
            key={note}
            accessibilityRole={onToggle ? 'button' : undefined}
            accessibilityLabel={`Tecla ${note}`}
            accessibilityState={{ selected: on.has(note) }}
            disabled={!onToggle}
            onPress={() => onToggle?.(note)}
            style={{ flex: 1, backgroundColor: on.has(note) ? fill(note) : color.card, borderRightWidth: 1, borderColor: color.hairline, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}
          >
            <Text style={{ fontFamily: font.uiBold, fontSize: 11, color: on.has(note) ? (note === root ? color.night : color.onNight) : color.inkFaint }}>{note}</Text>
          </Pressable>
        ))}
      </View>
      {BLACK.map(({ note, after }) => (
        <Pressable
          key={note}
          accessibilityRole={onToggle ? 'button' : undefined}
          accessibilityLabel={`Tecla ${note}`}
          accessibilityState={{ selected: on.has(note) }}
          disabled={!onToggle}
          onPress={() => onToggle?.(note)}
          style={{
            position: 'absolute',
            top: 0,
            left: `${(after + 1 - BLACK_WIDTH / 2) * whiteWidth}%`,
            width: `${BLACK_WIDTH * whiteWidth}%`,
            height: '60%',
            backgroundColor: on.has(note) ? fill(note) : color.ink,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            borderWidth: on.has(note) ? 2 : 0,
            borderColor: color.card,
          }}
        />
      ))}
    </View>
  );
}
