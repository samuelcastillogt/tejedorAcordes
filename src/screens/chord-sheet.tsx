import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ChordDetail } from '@/components/chord-detail';
import { Body, Button, Chip, Label } from '@/components/ui';
import { color, font, functionColor, functionLabel } from '@/constants/theme';
import { displayChord, transposeChord } from '@/lib/music/theory';
import { useProgression } from '@/lib/progression';

/** Sheet for one chord: how to play it and, if it belongs to the progression, move / swap / remove it. */
export default function ChordSheet() {
  const params = useLocalSearchParams<{ id: string; index?: string }>();
  const progression = useProgression();
  const { latin, capo, analysis, chords } = progression;
  const index = params.index !== undefined ? Number(params.index) : -1;
  const inProgression = index >= 0 && chords[index] === params.id;
  const degree = inProgression ? analysis?.degrees[index] : undefined;
  const accent = degree ? functionColor(degree.function, degree.role) : color.night;
  const chord = params.id;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.card }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }}>
      {degree ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: accent, fontFamily: font.display, fontSize: 30 }}>{degree.numeral}</Text>
          <View style={{ backgroundColor: accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ color: '#fff', fontFamily: font.uiBold, fontSize: 12 }}>{functionLabel(degree.function, degree.role)}</Text>
          </View>
        </View>
      ) : null}
      <ChordDetail chord={chord} latin={latin} accent={accent} capo={capo} shape={capo ? transposeChord(chord, -capo) : undefined} />
      {degree?.explanation ? <Body selectable>{degree.explanation}</Body> : null}

      {inProgression ? (
        <View style={{ gap: 12 }}>
          {degree?.substitutions?.length ? (
            <View style={{ gap: 8 }}>
              <Label>Cámbialo por</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {degree.substitutions.slice(0, 6).map((sub) => (
                  <Chip
                    key={sub.chord}
                    mono
                    label={`${displayChord(sub.chord, latin)} · ${sub.kind}`}
                    accessibilityLabel={`Cambiar por ${sub.chord}: ${sub.reason}`}
                    onPress={() => {
                      progression.replaceAt(index, sub.chord);
                      close();
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}
          <Label>En tu progresión</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              label="Mover antes"
              icon="chevron-left"
              variant="outline"
              style={{ flex: 1 }}
              disabled={index === 0}
              onPress={() => {
                progression.move(index, index - 1);
                close();
              }}
            />
            <Button
              label="Mover después"
              variant="outline"
              style={{ flex: 1 }}
              disabled={index === chords.length - 1}
              onPress={() => {
                progression.move(index, index + 1);
                close();
              }}
            />
          </View>
          <Button
            label="Quitar de la progresión"
            icon="trash"
            variant="danger"
            onPress={() => {
              progression.removeAt(index);
              close();
            }}
          />
        </View>
      ) : (
        <Button
          label="Agregar a mi progresión"
          icon="plus"
          variant="night"
          onPress={() => {
            progression.add(chord);
            close();
          }}
        />
      )}
    </ScrollView>
  );
}
