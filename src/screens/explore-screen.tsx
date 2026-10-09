import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ChordCard } from '@/components/chord-card';
import { Icon } from '@/components/icon';
import { PLAYER_BAR_HEIGHT, PlayerBar } from '@/components/player-bar';
import { Body, Card, Chip, ErrorNote, IconButton, Label, NightHeader, Screen } from '@/components/ui';
import { categoryColor, categoryLabel, color, font, radius } from '@/constants/theme';
import { Connection, getConnections } from '@/lib/api';
import { usePlayback } from '@/lib/audio/playback';
import { useCatalog } from '@/lib/catalog';
import { displayChord } from '@/lib/music/theory';
import { rankSuggestions, SUGGESTION_MODES, SuggestionMode } from '@/lib/music/suggestions';
import { useProgression } from '@/lib/progression';

/** "Bm" -> "Si menor" / "B menor"; "C" -> "Do mayor" / "C mayor". */
function keyName(key: string, latin: boolean) {
  const minor = key.endsWith('m');
  return `${displayChord(minor ? key.slice(0, -1) : key, latin)} ${minor ? 'menor' : 'mayor'}`;
}

const STARTERS = ['C', 'G', 'D', 'A', 'E', 'F', 'Am', 'Em', 'Bm', 'Dm'];

/**
 * "What can come next": the web's explorer reduced to its core loop on the phone —
 * hear a suggestion, add it, and keep going from the chord you just added.
 */
export default function ExploreScreen() {
  const progression = useProgression();
  const { chords, latin, analysis } = progression;
  const { notesOf } = useCatalog();
  const playback = usePlayback();
  const [picked, setPicked] = useState<string | null>(null);
  const [mode, setMode] = useState<SuggestionMode>('all');
  const [result, setResult] = useState<{ key: string; connections: Connection[]; error: string | null } | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Explore from the last chord of the progression unless the user picked another one.
  const current = picked ?? chords[chords.length - 1] ?? 'C';
  const tonality = progression.tonality ?? analysis?.key.id ?? chords[0] ?? current;

  const requestKey = `${current}|${tonality}|${attempt}`;
  const fresh = result?.key === requestKey;
  const loading = !fresh;
  const error = fresh ? result.error : null;
  // Keep showing the previous list while the next one loads.
  const connections = result?.connections;

  useEffect(() => {
    let cancelled = false;
    getConnections(current, tonality)
      .then((response) => !cancelled && setResult({ key: requestKey, connections: response.connections, error: null }))
      .catch((err: Error) => !cancelled && setResult((previous) => ({ key: requestKey, connections: previous?.connections ?? [], error: err.message })));
    return () => {
      cancelled = true;
    };
  }, [current, tonality, requestKey]);

  const ranked = useMemo(() => rankSuggestions(connections ?? [], mode), [connections, mode]);

  function audition(chord: string) {
    if (playback.playingId === chord) playback.stop();
    else void playback.play([notesOf(current), notesOf(chord)], { id: chord, bpm: 110 });
  }

  function add(chord: string) {
    progression.add(chord);
    setPicked(null); // follow the chord just added
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <Screen bottomSpace={PLAYER_BAR_HEIGHT + 24}>
        <NightHeader
          eyebrow="Explorar"
          title={`¿Qué sigue después de ${displayChord(current, latin)}?`}
          subtitle={`Opciones en ${keyName(tonality, latin)}, de la más natural a la más tensa. Escúchalas antes de elegir.`}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 4 }}>
            {SUGGESTION_MODES.map((option) => (
              <Chip key={option.id} tone="night" label={option.label} selected={mode === option.id} onPress={() => setMode(option.id)} accessibilityLabel={`${option.label}: ${option.hint}`} />
            ))}
          </ScrollView>
        </NightHeader>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label>Tu progresión</Label>
            {chords.length ? (
              <Pressable accessibilityRole="button" onPress={() => router.navigate('/')} hitSlop={8}>
                <Text style={{ color: color.night, fontFamily: font.uiBold, fontSize: 13 }}>Analizar ›</Text>
              </Pressable>
            ) : null}
          </View>
          {chords.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {chords.map((chord, index) => (
                <ChordCard
                  key={`${chord}-${index}`}
                  chord={chord}
                  degree={analysis?.degrees[index]}
                  latin={latin}
                  width={64}
                  active={(playback.playingId === 'progression' && playback.activeIndex === index) || (picked === chord && index === chords.lastIndexOf(chord))}
                  onPress={() => setPicked(chord)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={{ gap: 10 }}>
              <Body>Elige un acorde para empezar. Cada sugerencia que agregues será el punto de partida de la siguiente.</Body>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {STARTERS.map((chord) => (
                  <Chip key={chord} mono label={displayChord(chord, latin)} onPress={() => add(chord)} />
                ))}
              </View>
            </View>
          )}
        </Card>

        {error ? (
          <ErrorNote message={error} onRetry={() => setAttempt((value) => value + 1)} />
        ) : loading && !connections?.length ? (
          <ActivityIndicator color={color.night} style={{ marginTop: 24 }} />
        ) : (
          <View style={{ gap: 10, paddingHorizontal: 16 }}>
            {ranked.length === 0 ? <Body>No hay opciones de este tipo para {current}. Prueba con «Todas».</Body> : null}
            {ranked.map((suggestion) => (
              <SuggestionRow
                key={suggestion.target}
                chord={displayChord(suggestion.target, latin)}
                suggestion={suggestion}
                playing={playback.playingId === suggestion.target}
                onListen={() => audition(suggestion.target)}
                onAdd={() => add(suggestion.target)}
                onOpen={() => router.push({ pathname: '/acorde/[id]', params: { id: suggestion.target } })}
              />
            ))}
          </View>
        )}
      </Screen>
      <PlayerBar />
    </View>
  );
}

function SuggestionRow({
  chord,
  suggestion,
  playing,
  onListen,
  onAdd,
  onOpen,
}: {
  chord: string;
  suggestion: ReturnType<typeof rankSuggestions>[number];
  playing: boolean;
  onListen: () => void;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const accent = categoryColor(suggestion.category);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: color.card,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: color.hairline,
        borderLeftWidth: 5,
        borderLeftColor: accent,
        padding: 12,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${chord}, ${categoryLabel(suggestion.category)}, ${Math.round(suggestion.score)} de 100`}
        accessibilityHint="Abre el diagrama del acorde"
        onPress={onOpen}
        style={({ pressed }) => ({ flex: 1, gap: 2, opacity: pressed ? 0.7 : 1 })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <Text style={{ color: color.ink, fontFamily: font.monoBold, fontSize: 20 }}>{chord}</Text>
          <Text style={{ color: accent, fontFamily: font.uiBold, fontSize: 12 }}>
            {categoryLabel(suggestion.category)} · {Math.round(suggestion.score)}
          </Text>
        </View>
        {suggestion.explanation ? (
          <Text numberOfLines={2} style={{ color: color.inkMute, fontFamily: font.ui, fontSize: 13, lineHeight: 18 }}>
            {suggestion.explanation}
          </Text>
        ) : null}
      </Pressable>
      <IconButton icon={playing ? 'stop' : 'play'} tone="paper" size={40} label={`Escuchar el cambio a ${chord}`} onPress={onListen} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Agregar ${chord} a la progresión`}
        onPress={onAdd}
        style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, backgroundColor: color.night, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}
      >
        <Icon name="plus" size={18} color={color.onNight} />
      </Pressable>
    </View>
  );
}
