import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ChordDetail } from '@/components/chord-detail';
import { ChordKeypad } from '@/components/chord-keypad';
import { PianoKeys } from '@/components/piano-keys';
import { Body, Button, Card, Chip, ErrorNote, Label, NightHeader, Screen, Segmented } from '@/components/ui';
import { color, font } from '@/constants/theme';
import { useCatalog } from '@/lib/catalog';
import { displayChord, findChordsWithNotes } from '@/lib/music/theory';
import { useProgression } from '@/lib/progression';

/**
 * The instrument companion the website does not need: a chord dictionary to look up shapes while
 * playing, and the reverse — tap notes on the piano and see which chord they make.
 */
export default function ChordsScreen() {
  const catalog = useCatalog();
  const progression = useProgression();
  const { latin } = progression;
  const [tool, setTool] = useState<'dictionary' | 'reverse'>('dictionary');
  const [chord, setChord] = useState('C');
  const [pressed, setPressed] = useState<string[]>([]);
  const [added, setAdded] = useState<string | null>(null);
  const [keypadKey, setKeypadKey] = useState(0);

  const matches = useMemo(() => findChordsWithNotes(catalog.chords, pressed).slice(0, 12), [catalog.chords, pressed]);

  function addToProgression(id: string) {
    progression.add(id);
    setAdded(`${displayChord(id, latin)} agregado a tu progresión.`);
  }

  return (
    <Screen bottomSpace={40}>
      <NightHeader eyebrow="Acordes" title={tool === 'dictionary' ? 'Cómo se toca' : '¿Qué acorde es?'} subtitle={tool === 'dictionary' ? 'Elige la nota y el tipo: te mostramos la forma en la guitarra y en el piano.' : 'Toca las notas que oyes o que tienes en el instrumento y te decimos qué acordes las contienen.'}>
        <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
          <Segmented
            tone="night"
            options={[
              { id: 'dictionary', label: 'Diccionario' },
              { id: 'reverse', label: 'Buscar por notas' },
            ]}
            value={tool}
            onChange={setTool}
          />
        </View>
      </NightHeader>

      {catalog.error ? <ErrorNote message={catalog.error} onRetry={catalog.reload} /> : null}

      {tool === 'dictionary' ? (
        <>
          <Card>
            <ChordKeypad key={keypadKey} initial={chord} latin={latin} valid={(id) => catalog.byId.size === 0 || catalog.byId.has(id)} onChange={setChord} />
          </Card>
          <Card>
            <ChordDetail chord={chord} latin={latin} />
            <Button label="Agregar a mi progresión" icon="plus" variant="night" onPress={() => addToProgression(chord)} />
            {added ? <Text style={{ color: color.tonic, fontFamily: font.uiMedium, fontSize: 14 }}>{added}</Text> : null}
          </Card>
        </>
      ) : (
        <>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label>Toca las teclas</Label>
              {pressed.length ? (
                <Text onPress={() => setPressed([])} accessibilityRole="button" style={{ color: color.night, fontFamily: font.uiBold, fontSize: 13 }}>
                  Limpiar
                </Text>
              ) : null}
            </View>
            <PianoKeys notes={pressed} height={150} onToggle={(note) => setPressed((current) => (current.includes(note) ? current.filter((n) => n !== note) : [...current, note]))} />
            <Body style={{ fontSize: 13 }}>{pressed.length ? `Notas: ${pressed.join(' – ')}` : 'Elige al menos dos notas.'}</Body>
          </Card>
          {pressed.length >= 2 ? (
            <Card>
              <Label>{matches.length ? 'Acordes que las contienen' : 'Ningún acorde contiene esas notas'}</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {matches.map(({ chord: match, exact }) => (
                  <Chip
                    key={match.id}
                    mono
                    selected={exact}
                    label={displayChord(match.id, latin)}
                    accessibilityLabel={`${match.id}${exact ? ', coincide exactamente' : ''}`}
                    onPress={() => {
                      setChord(match.id);
                      setKeypadKey((value) => value + 1);
                      setTool('dictionary');
                    }}
                  />
                ))}
              </ScrollView>
              {matches.some((m) => m.exact) ? <Body style={{ fontSize: 13 }}>Resaltado: coincide nota por nota. Toca uno para ver cómo se toca.</Body> : null}
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}
