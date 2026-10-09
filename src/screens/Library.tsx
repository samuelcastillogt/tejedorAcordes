import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cw } from '@/constants/chordweaver-theme';
import { deleteProgression, listProgressions, Progression } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Library() {
  const { user, ready } = useAuth();
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

  // Reload whenever the screen comes back into view (e.g. after saving in the editor).
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function confirmDelete(progression: Progression) {
    Alert.alert(`¿Eliminar "${progression.name}"?`, progression.isPublic ? 'El enlace público dejará de funcionar.' : 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProgression(progression.id);
            setItems((current) => current?.filter((item) => item.id !== progression.id) ?? null);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo eliminar');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12}>
          <Text style={styles.back}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Biblioteca</Text>
        <Text style={styles.title}>Mis progresiones</Text>

        {!ready ? (
          <ActivityIndicator color={cw.primary} />
        ) : !user ? (
          <View style={styles.card}>
            <Text style={styles.helper}>Entra para ver las progresiones que guardaste en la app o en la web.</Text>
            <Pressable onPress={() => router.push('/cuenta')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Entrar o crear cuenta</Text>
            </Pressable>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : items === null ? (
          <ActivityIndicator color={cw.primary} />
        ) : items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.helper}>Aún no has guardado nada. Arma una progresión y pulsa «Guardar».</Text>
            <Pressable onPress={() => router.push('/tabs')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Abrir el editor</Text>
            </Pressable>
          </View>
        ) : (
          items.map((progression) => (
            <View key={progression.id} style={styles.card}>
              <Text style={styles.cardTitle}>{progression.name}</Text>
              <Text style={styles.chords}>{progression.chords.join('  ')}</Text>
              <Text style={styles.meta}>
                {progression.tonality ? `Tonalidad ${progression.tonality} · ` : ''}
                {progression.isPublic ? 'Pública' : 'Privada'} · {new Date(progression.updatedAt).toLocaleDateString('es')}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/tabs', params: { chords: progression.chords.join(','), name: progression.name } })
                  }
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Abrir</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(progression)} style={styles.dangerButton}>
                  <Text style={styles.dangerButtonText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cw.canvasSoft },
  content: { gap: 14, padding: 18, paddingBottom: 64 },
  back: { color: cw.primary, fontSize: 16, fontWeight: '700' },
  eyebrow: { color: cw.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: cw.ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  card: { backgroundColor: cw.canvas, borderColor: cw.hairline, borderRadius: 20, borderWidth: 1, gap: 10, padding: 18 },
  cardTitle: { color: cw.ink, fontSize: 20, fontWeight: '800' },
  chords: { color: cw.ink, fontFamily: 'monospace', fontSize: 15 },
  meta: { color: cw.muted, fontSize: 12 },
  helper: { color: cw.muted, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  primaryButton: { alignItems: 'center', backgroundColor: cw.primary, borderRadius: 12, justifyContent: 'center', minHeight: 44, paddingHorizontal: 18 },
  primaryButtonText: { color: cw.canvas, fontSize: 15, fontWeight: '800' },
  dangerButton: { alignItems: 'center', borderColor: cw.danger, borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 18 },
  dangerButtonText: { color: cw.danger, fontSize: 15, fontWeight: '700' },
  errorText: { color: cw.danger, fontSize: 14, lineHeight: 20 },
});
