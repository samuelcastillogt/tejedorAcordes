import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, Text, View } from 'react-native';

import { Body, Button, Card, ErrorNote, IconButton, Label, NightHeader, Screen } from '@/components/ui';
import { color, font, radius } from '@/constants/theme';
import { deleteProgression, listProgressions, Progression } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { displayChord } from '@/lib/music/theory';
import { useProgression } from '@/lib/progression';

/** Saved progressions, the same library as on the website. */
export default function LibraryScreen() {
  const { user, ready, accountsEnabled } = useAuth();
  const progression = useProgression();
  const [items, setItems] = useState<Progression[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      setItems((await listProgressions()).progressions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus progresiones');
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function open(item: Progression) {
    progression.load({ name: item.name, chords: item.chords, tonality: item.tonality, savedId: item.id });
    router.navigate('/');
  }

  function confirmDelete(item: Progression) {
    Alert.alert(`¿Eliminar "${item.name}"?`, item.isPublic ? 'El enlace público dejará de funcionar.' : 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProgression(item.id);
            setItems((current) => current?.filter((p) => p.id !== item.id) ?? null);
            if (progression.savedId === item.id) progression.setSavedId(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar');
          }
        },
      },
    ]);
  }

  return (
    <Screen
      refreshControl={
        user ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        ) : undefined
      }
    >
      <NightHeader
        eyebrow="Biblioteca"
        title="Mis progresiones"
        subtitle={user ? 'Lo que guardes aquí o en la web, en todos tus dispositivos.' : 'Guarda tus progresiones y ábrelas también en la web.'}
        right={<IconButton icon="user" label={user ? 'Mi cuenta' : 'Entrar'} onPress={() => router.push('/cuenta')} />}
      />

      {!ready ? (
        <ActivityIndicator color={color.night} />
      ) : !accountsEnabled ? (
        <Card>
          <Body>Las cuentas no están disponibles en este momento. Tu progresión actual se guarda en este teléfono.</Body>
        </Card>
      ) : !user ? (
        <Card>
          <Body>Crea una cuenta gratis para guardar hasta 5 progresiones y abrirlas desde cualquier dispositivo.</Body>
          <Button label="Entrar o crear cuenta" variant="night" onPress={() => router.push('/cuenta')} />
        </Card>
      ) : error ? (
        <ErrorNote message={error} onRetry={load} />
      ) : items === null ? (
        <ActivityIndicator color={color.night} />
      ) : items.length === 0 ? (
        <Card>
          <Body>Aún no has guardado nada. Arma una progresión en Analizar y pulsa «Guardar en mi biblioteca».</Body>
          <Button label="Ir a Analizar" variant="night" onPress={() => router.navigate('/')} />
        </Card>
      ) : (
        <View style={{ gap: 10, paddingHorizontal: 16 }}>
          <Label>{items.length === 1 ? '1 progresión' : `${items.length} progresiones`}</Label>
          {items.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.name}`}
              onPress={() => open(item)}
              onLongPress={() => confirmDelete(item)}
              style={({ pressed }) => ({ backgroundColor: color.card, borderRadius: radius.lg, borderCurve: 'continuous', borderWidth: 1, borderColor: progression.savedId === item.id ? color.night : color.hairline, padding: 16, gap: 6, opacity: pressed ? 0.85 : 1 })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ flex: 1, color: color.ink, fontFamily: font.display, fontSize: 20 }} numberOfLines={1}>
                  {item.name}
                </Text>
                <IconButton icon="trash" tone="paper" size={34} label={`Eliminar ${item.name}`} onPress={() => confirmDelete(item)} />
              </View>
              <Text style={{ color: color.ink, fontFamily: font.mono, fontSize: 15 }} numberOfLines={1}>
                {item.chords.map((chord) => displayChord(chord, progression.latin)).join('  ')}
              </Text>
              <Text style={{ color: color.inkMute, fontFamily: font.ui, fontSize: 12 }}>
                {item.tonality ? `Tonalidad ${displayChord(item.tonality, progression.latin)} · ` : ''}
                {item.source === 'app-movil' ? 'Desde la app' : 'Desde la web'} · {new Date(item.updatedAt).toLocaleDateString('es')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
