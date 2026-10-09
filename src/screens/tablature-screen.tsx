import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, Text, View } from 'react-native';

import { GuitarDiagram } from '@/components/guitar-diagram';
import { Button, ErrorNote, Label } from '@/components/ui';
import { color, font, radius } from '@/constants/theme';
import { generateTablature, TablatureResponse } from '@/lib/api';
import { displayChord } from '@/lib/music/theory';
import { useProgression } from '@/lib/progression';

/** Tablature of the current progression: chord shapes plus the text tab, ready to share. */
export default function TablatureScreen() {
  const { name, chords, latin } = useProgression();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; tab: TablatureResponse | null; error: string | null } | null>(null);
  const tab = result?.tab ?? null;
  const error = result?.attempt === attempt ? result.error : null;

  useEffect(() => {
    let cancelled = false;
    if (!chords.length) return;
    generateTablature(name || 'Mi progresión', chords)
      .then((value) => !cancelled && setResult({ attempt, tab: value, error: null }))
      .catch((err: Error) => !cancelled && setResult({ attempt, tab: null, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [name, chords, attempt]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.card }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }}>
      <Text style={{ color: color.ink, fontFamily: font.display, fontSize: 28 }}>{name}</Text>
      {!chords.length ? <Text style={{ color: color.inkMute, fontFamily: font.ui }}>Agrega acordes para generar la tablatura.</Text> : null}
      {error ? <ErrorNote message={error} onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {chords.length && !tab && !error ? <ActivityIndicator color={color.night} /> : null}
      {tab ? (
        <>
          <Label>Formas</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {tab.diagrams.map((diagram, index) => (
              <View key={`${diagram.chord}-${index}`} style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ color: color.ink, fontFamily: font.monoBold, fontSize: 18 }}>{displayChord(diagram.chord, latin)}</Text>
                <GuitarDiagram frets={diagram.frets} size={120} />
              </View>
            ))}
          </ScrollView>
          <Label>Tablatura y arpegio</Label>
          <ScrollView horizontal style={{ backgroundColor: color.paper, borderRadius: radius.md }} contentContainerStyle={{ padding: 14 }}>
            <Text selectable style={{ color: color.ink, fontFamily: font.mono, fontSize: 12, lineHeight: 19 }}>
              {tab.text}
            </Text>
          </ScrollView>
          <Button label="Compartir tablatura" icon="share" variant="night" onPress={() => void Share.share({ message: tab.text })} />
        </>
      ) : null}
      <Button label="Cerrar" variant="outline" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
    </ScrollView>
  );
}
