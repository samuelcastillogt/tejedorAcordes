import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { ChordCard } from '@/components/chord-card';
import { ChordKeypad } from '@/components/chord-keypad';
import { FluencyCurve } from '@/components/fluency-curve';
import { PLAYER_BAR_HEIGHT, PlayerBar } from '@/components/player-bar';
import { Body, Button, Card, Chip, ErrorNote, IconButton, Label, NightHeader, Screen, Segmented, Title } from '@/components/ui';
import { WEB_URL } from '@/constants/links';
import { color, font, functionColor, functionLabel, radius } from '@/constants/theme';
import { isPlanLimitError, parseChords, saveProgression, updateProgression } from '@/lib/api';
import { usePlayback } from '@/lib/audio/playback';
import { useAuth } from '@/lib/auth';
import { useCatalog } from '@/lib/catalog';
import { displayChord, splitChordInput, transposeChord } from '@/lib/music/theory';
import { PRESETS } from '@/lib/music/suggestions';
import { useProgression } from '@/lib/progression';

const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'A#', 'D#', 'G#'].flatMap((root) => [root, `${root}m`]);

export default function AnalyzeScreen() {
  const progression = useProgression();
  const { chords, labels, latin, analysis, analyzing, analysisError, capo } = progression;
  const catalog = useCatalog();
  const playback = usePlayback();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  const playingProgression = playback.playingId === 'progression';

  async function addTyped() {
    const symbols = splitChordInput(text);
    if (!symbols.length) return;
    setParsing(true);
    setInputError(null);
    try {
      const { results } = await parseChords(symbols);
      const ids = results.map((r) => r.chord).filter((id): id is string => Boolean(id));
      const unknown = results.filter((r) => !r.chord).map((r) => r.input);
      if (ids.length) progression.addMany(ids);
      setText('');
      if (unknown.length) setInputError(`No reconocí: ${unknown.join(', ')}. Prueba con Bm, F#m7, SOLm o D/F#.`);
    } catch (err) {
      setInputError(err instanceof Error ? err.message : 'No se pudieron leer los acordes');
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    if (!user) {
      router.push('/cuenta');
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const body = { name: progression.name.trim() || 'Mi progresión', chords, tonality: analysis?.key.id ?? progression.tonality };
      const saved = progression.savedId ? await updateProgression(progression.savedId, body) : await saveProgression(body);
      progression.setSavedId(saved.id);
      setSaveMessage({ ok: true, text: progression.savedId ? 'Cambios guardados. También la verás en la web.' : 'Guardada en tu biblioteca. También la verás en la web.' });
    } catch (err) {
      // Android: plans are not sold inside the app (Google Play billing rules), only the limit is explained.
      setSaveMessage({
        ok: false,
        text: isPlanLimitError(err)
          ? 'Llegaste al límite de 5 progresiones del plan Gratis. Borra alguna en Biblioteca para guardar otra.'
          : err instanceof Error
            ? err.message
            : 'No se pudo guardar',
      });
    } finally {
      setSaving(false);
    }
  }

  function share() {
    const names = chords.map((chord) => displayChord(chord, latin)).join(' – ');
    const link = `${WEB_URL}/?chords=${encodeURIComponent(chords.join(','))}${analysis ? `&key=${encodeURIComponent(analysis.key.id)}` : ''}`;
    const key = analysis ? ` en ${analysis.key.label}` : '';
    void Share.share({ message: `${progression.name}: ${names}${key}\nEscúchala y mira por qué funciona: ${link}` });
  }

  const cardWidth = Math.min(84, Math.max(68, (width - 64) / 5));

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <Screen bottomSpace={PLAYER_BAR_HEIGHT + 24}>
        <NightHeader
          eyebrow="ChordWeaver"
          title="¿Por qué suena así?"
          subtitle="Escribe los acordes de una canción y te decimos su tonalidad, la función de cada acorde y dónde está la tensión."
          right={<IconButton icon="user" label={user ? 'Mi cuenta' : 'Entrar'} onPress={() => router.push('/cuenta')} />}
        >
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={addTyped}
              placeholder="Bm G D A  ·  SOL RE Mim DO"
              placeholderTextColor={color.onNightMute}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              accessibilityLabel="Escribe acordes separados por espacios"
              style={{ flex: 1, minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: color.hairlineNight, backgroundColor: color.nightDeep, color: color.onNight, paddingHorizontal: 14, fontFamily: font.mono, fontSize: 16 }}
            />
            {/* Gold only when there is something to add: a dimmed gold reads as brown on night. */}
            <Button label="Agregar" variant={text.trim() ? 'gold' : 'outlineNight'} onPress={addTyped} loading={parsing} disabled={!text.trim()} />
          </View>
          {inputError ? <Text style={{ color: '#ffb4a8', fontFamily: font.ui, fontSize: 13 }}>{inputError}</Text> : null}
        </NightHeader>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              value={progression.name}
              onChangeText={progression.setName}
              accessibilityLabel="Nombre de la progresión"
              style={{ flex: 1, color: color.ink, fontFamily: font.display, fontSize: 22, paddingVertical: 4 }}
            />
            {chords.length ? <IconButton icon="trash" tone="paper" size={36} label="Empezar de cero" onPress={progression.clear} /> : null}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Segmented
              options={[
                { id: 'chords', label: 'Cifrado' },
                { id: 'numerals', label: 'Grados' },
              ]}
              value={labels}
              onChange={(value) => progression.update({ labels: value })}
            />
            <Segmented
              options={[
                { id: 'us', label: 'C D E' },
                { id: 'latin', label: 'Do Re Mi' },
              ]}
              value={latin ? 'latin' : 'us'}
              onChange={(value) => progression.update({ latin: value === 'latin' })}
            />
          </View>

          {chords.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {chords.map((chord, index) => (
                <ChordCard
                  key={`${chord}-${index}`}
                  chord={chord}
                  degree={analysis?.degrees[index]}
                  labels={labels}
                  latin={latin}
                  width={cardWidth}
                  active={playingProgression && playback.activeIndex === index}
                  onPress={() => router.push({ pathname: '/acorde/[id]', params: { id: chord, index: String(index) } })}
                />
              ))}
              <ChordAddTile width={cardWidth} onPress={() => setShowKeypad(true)} />
            </ScrollView>
          ) : (
            <View style={{ gap: 10 }}>
              <Body>Escribe acordes arriba, elígelos abajo o empieza con una progresión conocida:</Body>
              {PRESETS.map((preset) => (
                <Chip key={preset.name} label={`${preset.name} · ${preset.mood}`} onPress={() => progression.load({ name: preset.name, chords: preset.chords })} />
              ))}
            </View>
          )}
          {chords.length ? <Body style={{ fontSize: 13 }}>Toca un acorde para escucharlo, ver cómo se toca, moverlo o cambiarlo.</Body> : null}
        </Card>

        {showKeypad || chords.length === 0 ? (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label>Elegir acorde</Label>
              {chords.length ? <IconButton icon="close" tone="paper" size={32} label="Cerrar" onPress={() => setShowKeypad(false)} /> : null}
            </View>
            <ChordKeypad latin={latin} valid={(id) => catalog.byId.size === 0 || catalog.byId.has(id)} onAdd={progression.add} />
          </Card>
        ) : null}

        {analyzing && !analysis ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color={color.night} />
            <Body>Leyendo la armonía…</Body>
          </Card>
        ) : null}
        {chords.length === 1 ? (
          <Card>
            <Body>Agrega al menos otro acorde y verás la tonalidad y la función de cada uno.</Body>
          </Card>
        ) : null}
        {analysisError ? <ErrorNote message={analysisError} onRetry={chords.length >= 2 ? progression.analyze : undefined} /> : null}

        {analysis ? (
          <>
            <Card>
              <Label>Tonalidad</Label>
              <Title style={{ fontSize: 32, lineHeight: 36 }}>{analysis.key.label}</Title>
              <Body>
                {analysis.key.detected ? `Detectada automáticamente · confianza ${Math.round(analysis.key.confidence * 100)}%` : 'Elegida por ti'}
                {' · '}
                <Text onPress={() => setShowKeys((value) => !value)} style={{ color: color.night, fontFamily: font.uiBold, textDecorationLine: 'underline' }}>
                  {showKeys ? 'Cerrar' : '¿No es esa? Cámbiala'}
                </Text>
              </Body>
              {showKeys ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <Chip label="Auto" selected={!progression.tonality} onPress={() => progression.setTonality(null)} />
                  {KEYS.map((key) => (
                    <Chip key={key} mono label={displayChord(key, latin)} selected={progression.tonality === key} onPress={() => progression.setTonality(key)} />
                  ))}
                </View>
              ) : null}
            </Card>

            <View style={{ gap: 10 }}>
              {analysis.degrees.map((degree, index) => {
                const accent = functionColor(degree.function, degree.role);
                return (
                  <Card key={`${degree.input}-${index}`} style={{ borderTopWidth: 5, borderTopColor: accent, gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: color.ink, fontFamily: font.monoBold, fontSize: 22 }}>{displayChord(degree.chord, latin)}</Text>
                      <Text style={{ color: accent, fontFamily: font.display, fontSize: 28 }}>{degree.numeral}</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', backgroundColor: accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                      <Text style={{ color: '#fff', fontFamily: font.uiBold, fontSize: 12 }}>{functionLabel(degree.function, degree.role)}</Text>
                    </View>
                    <Body selectable>{degree.explanation}</Body>
                    {degree.substitutions?.length ? (
                      <View style={{ gap: 6 }}>
                        <Label>Prueba en su lugar</Label>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {degree.substitutions.slice(0, 4).map((sub) => (
                            <Chip
                              key={sub.chord}
                              mono
                              label={`${displayChord(sub.chord, latin)} · ${sub.kind}`}
                              accessibilityLabel={`Cambiar ${degree.chord} por ${sub.chord}: ${sub.reason}`}
                              onPress={() => progression.replaceAt(index, sub.chord)}
                            />
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </Card>
                );
              })}
            </View>

            <Card>
              <Label>Fluidez de cada cambio</Label>
              <Title>Promedio {Math.round(analysis.averageScore)}/100</Title>
              <FluencyCurve points={analysis.tensionCurve} width={width - 66} />
            </Card>

            <Card>
              <Label>Lo que cuenta esta armonía</Label>
              {analysis.suggestions.map((suggestion) => (
                <View key={suggestion} style={{ borderLeftWidth: 3, borderLeftColor: color.gold, paddingLeft: 12 }}>
                  <Body selectable style={{ color: color.ink }}>
                    {suggestion}
                  </Body>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {chords.length > 0 ? (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Label>Tono</Label>
                <Body style={{ fontSize: 13 }}>Sube o baja toda la progresión</Body>
              </View>
              <Stepper label="tono" value={null} onMinus={() => progression.transpose(-1)} onPlus={() => progression.transpose(1)} />
            </View>
            <View style={{ height: 1, backgroundColor: color.hairline }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Label>Capo</Label>
                <Body style={{ fontSize: 13 }}>{capo ? `Traste ${capo}: toca estas formas` : 'Sin capo'}</Body>
              </View>
              <Stepper label="capo" value={capo} onMinus={() => progression.update({ capo: Math.max(0, capo - 1) })} onPlus={() => progression.update({ capo: Math.min(9, capo + 1) })} />
            </View>
            {capo ? (
              <Text selectable style={{ color: color.ink, fontFamily: font.monoBold, fontSize: 18 }}>
                {chords.map((chord) => displayChord(transposeChord(chord, -capo), latin)).join('  ')}
              </Text>
            ) : null}
          </Card>
        ) : null}

        {chords.length ? (
          <Card>
            <Label>Llévatela</Label>
            <Button label={user ? (progression.savedId ? 'Guardar cambios' : 'Guardar en mi biblioteca') : 'Entrar para guardar'} icon="save" variant="teal" loading={saving} onPress={save} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label="Tablatura" variant="outline" style={{ flex: 1 }} onPress={() => router.push('/tablatura')} />
              <Button label="Compartir" icon="share" variant="outline" style={{ flex: 1 }} onPress={share} />
            </View>
            {saveMessage ? (
              <Text selectable style={{ color: saveMessage.ok ? color.tonic : color.danger, fontFamily: font.uiMedium, fontSize: 14, lineHeight: 20 }}>
                {saveMessage.text}
              </Text>
            ) : null}
          </Card>
        ) : null}
      </Screen>
      <PlayerBar />
    </View>
  );
}

function ChordAddTile({ width, onPress }: { width: number; onPress: () => void }) {
  return (
    <View style={{ width, minHeight: 84 }}>
      <Button label="" icon="plus" variant="outline" onPress={onPress} accessibilityLabel="Agregar acorde" style={{ flex: 1, borderStyle: 'dashed', paddingHorizontal: 0 }} />
    </View>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: number | null; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <IconButton icon="minus" tone="paper" size={38} label={`Bajar ${label}`} onPress={onMinus} />
      {value !== null ? <Text style={{ minWidth: 22, textAlign: 'center', color: color.ink, fontFamily: font.monoBold, fontSize: 18, fontVariant: ['tabular-nums'] }}>{value}</Text> : null}
      <IconButton icon="plus" tone="paper" size={38} label={`Subir ${label}`} onPress={onPlus} />
    </View>
  );
}
