import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cw } from '@/constants/chordweaver-theme';
import { Chord, Connection, getChords, getConnections } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { categoryColor, categoryLabel, chordFamilyColor } from '@/lib/music';

const defaultChord = 'C';
const defaultTonality = 'C';

export default function Home() {
  const { user, accountsEnabled } = useAuth();
  const [chords, setChords] = useState<Chord[]>([]);
  const [selectedChord, setSelectedChord] = useState(defaultChord);
  const [tonality, setTonality] = useState(defaultTonality);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError(null);
      try {
        const catalog = await getChords();
        if (!cancelled) setChords(catalog);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConnections() {
      if (!selectedChord) return;
      setError(null);
      try {
        const response = await getConnections(selectedChord, tonality);
        if (!cancelled) setConnections(response.connections);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar conexiones');
        }
      }
    }

    loadConnections();

    return () => {
      cancelled = true;
    };
  }, [selectedChord, tonality]);

  const selected = useMemo(
    () => chords.find((chord) => chord.id === selectedChord),
    [chords, selectedChord],
  );
  const tonalities = chords.filter((chord) => chord.type === 'major' || chord.type === 'minor').slice(0, 24);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.topBar}>
            <Text style={styles.eyebrow}>ChordWeaver</Text>
            {accountsEnabled && (
              <Link href="/cuenta" asChild>
                <Pressable style={styles.accountPill} hitSlop={8}>
                  <Text style={styles.accountText}>{user ? user.displayName || 'Mi cuenta' : 'Entrar'}</Text>
                </Pressable>
              </Link>
            )}
          </View>
          <Text style={styles.title}>Encuentra el siguiente acorde desde el teléfono.</Text>
          <Text style={styles.subtitle}>
            Descubre qué acordes conectan con el que estás tocando, mira la tensión de cada cambio y conviértelo en tablatura.
          </Text>
          <Link href="/tabs" asChild>
            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Armar una progresión</Text>
            </Pressable>
          </Link>
          {user && (
            <Link href="/biblioteca" asChild>
              <Pressable style={styles.heroLink} hitSlop={8}>
                <Text style={styles.heroLinkText}>Mis progresiones guardadas</Text>
              </Pressable>
            </Link>
          )}
        </View>

        {loading ? (
          <View style={styles.statusCard}>
            <ActivityIndicator color={cw.primary} />
            <Text style={styles.statusText}>Cargando acordes…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Sin conexión con ChordWeaver</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Acorde actual</Text>
              <Text style={styles.currentChord}>{selected?.id ?? selectedChord}</Text>
              <Text style={styles.meta}>
                Familia {selected?.type ?? '-'} - Triada {selected?.triad.join('-') ?? '-'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {chords.filter((chord) => ['major', 'minor', 'dom7'].includes(chord.type)).slice(0, 36).map((chord) => (
                  <Pressable
                    key={chord.id}
                    onPress={() => setSelectedChord(chord.id)}
                    style={[
                      styles.chordChip,
                      selectedChord === chord.id && styles.chordChipActive,
                      { borderColor: chordFamilyColor(chord.type) },
                    ]}
                  >
                    <Text style={[styles.chordChipText, selectedChord === chord.id && styles.chordChipTextActive]}>
                      {chord.id}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Tonalidad</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {tonalities.map((chord) => (
                  <Pressable
                    key={`tonality-${chord.id}`}
                    onPress={() => setTonality(chord.id)}
                    style={[styles.smallChip, tonality === chord.id && styles.smallChipActive]}
                  >
                    <Text style={[styles.smallChipText, tonality === chord.id && styles.smallChipTextActive]}>
                      {chord.id}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Sugerencias</Text>
              <Text style={styles.sectionTitle}>Qué puede seguir después de {selectedChord}</Text>
              <View style={styles.connectionList}>
                {connections.map((connection) => (
                  <Pressable
                    key={connection.target}
                    onPress={() => setSelectedChord(connection.target)}
                    style={styles.connectionRow}
                  >
                    <View>
                      <Text style={styles.connectionChord}>{connection.target}</Text>
                      <Text style={styles.connectionCategory}>{categoryLabel(connection.category)}</Text>
                    </View>
                    <Text style={[styles.score, { color: categoryColor(connection.category) }]}>{connection.score}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cw.canvasSoft },
  content: { gap: 18, padding: 18, paddingBottom: 96 },
  hero: { backgroundColor: cw.primary, borderRadius: 24, gap: 14, padding: 24 },
  eyebrow: { color: cw.violet, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: cw.canvas, fontSize: 34, fontWeight: '700', letterSpacing: -1, lineHeight: 36 },
  subtitle: { color: '#d8d5e8', fontSize: 16, lineHeight: 23 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  accountPill: { borderColor: cw.hairlineDark, borderRadius: 999, borderWidth: 1, minHeight: 36, justifyContent: 'center', paddingHorizontal: 14 },
  accountText: { color: cw.canvas, fontSize: 13, fontWeight: '700' },
  heroLink: { alignSelf: 'center', minHeight: 36, justifyContent: 'center' },
  heroLinkText: { color: cw.violet, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  heroButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: cw.canvas,
    borderRadius: 999,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  heroButtonText: { color: cw.primary, fontSize: 14, fontWeight: '800' },
  statusCard: { alignItems: 'center', backgroundColor: cw.canvas, borderRadius: 18, gap: 12, padding: 24 },
  statusText: { color: cw.muted, fontSize: 15 },
  errorCard: {
    backgroundColor: '#fff1f0',
    borderColor: '#fecdca',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  errorTitle: { color: cw.danger, fontSize: 18, fontWeight: '700' },
  errorText: { color: cw.danger, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: cw.canvas, borderColor: cw.hairline, borderRadius: 20, borderWidth: 1, gap: 14, padding: 18 },
  sectionLabel: { color: cw.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase' },
  sectionTitle: { color: cw.ink, fontSize: 24, fontWeight: '700', lineHeight: 28 },
  currentChord: { color: cw.ink, fontSize: 56, fontWeight: '800', lineHeight: 60 },
  meta: { color: cw.muted, fontSize: 14 },
  chipRow: { gap: 10, paddingRight: 18 },
  chordChip: {
    alignItems: 'center',
    backgroundColor: cw.canvas,
    borderRadius: 999,
    borderWidth: 2,
    minHeight: 44,
    minWidth: 58,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  chordChipActive: { backgroundColor: cw.primary, borderColor: cw.primary },
  chordChipText: { color: cw.ink, fontSize: 15, fontWeight: '700' },
  chordChipTextActive: { color: cw.canvas },
  smallChip: { backgroundColor: cw.canvasSoft, borderRadius: 999, minHeight: 44, paddingHorizontal: 16, paddingVertical: 12 },
  smallChipActive: { backgroundColor: cw.teal },
  smallChipText: { color: cw.ink, fontSize: 14, fontWeight: '700' },
  smallChipTextActive: { color: cw.canvas },
  connectionList: { gap: 10 },
  connectionRow: {
    alignItems: 'center',
    backgroundColor: cw.canvasSoft,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    padding: 14,
  },
  connectionChord: { color: cw.ink, fontSize: 20, fontWeight: '800' },
  connectionCategory: { color: cw.muted, fontSize: 13, marginTop: 2 },
  score: { fontSize: 20, fontWeight: '800' },
});
