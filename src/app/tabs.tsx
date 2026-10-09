import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cw } from '@/constants/chordweaver-theme';
import { analyzeProgression, AnalyzeResponse, generateTablature, isPlanLimitError, saveProgression, TablatureResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { categoryColor, categoryLabel, functionColor } from '@/lib/music';

const starterProgression = ['C', 'G7', 'Am', 'F'];
const quickChords = ['C', 'G', 'G7', 'Am', 'F', 'Dm', 'Em', 'A7', 'D', 'E7', 'Bm', 'F+'];

type Analysis = AnalyzeResponse['analysis'];

export default function ProgressionScreen() {
  const params = useLocalSearchParams<{ chords?: string; name?: string }>();
  const { user, accountsEnabled } = useAuth();
  const [name, setName] = useState('Nueva progresión');
  const [progression, setProgression] = useState(starterProgression);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tablature, setTablature] = useState<TablatureResponse | null>(null);
  const [loading, setLoading] = useState<'analysis' | 'tablature' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Opened from the library: load that progression once per link (state adjusted during render).
  const linkKey = params.chords ? `${params.name ?? ''}|${params.chords}` : null;
  const [loadedLink, setLoadedLink] = useState<string | null>(null);
  if (linkKey && linkKey !== loadedLink) {
    setLoadedLink(linkKey);
    setProgression(params.chords!.split(',').filter(Boolean));
    if (params.name) setName(params.name);
    setAnalysis(null);
    setTablature(null);
  }

  function clearGeneratedOutput() {
    setAnalysis(null);
    setTablature(null);
    setSaved(null);
  }

  async function save() {
    if (!user) {
      router.push('/cuenta');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const result = await saveProgression({ name: name.trim() || 'Progresión', chords: progression, tonality: analysis?.key.id ?? null });
      setSaved(`Guardada en tu biblioteca: ${result.name}`);
    } catch (err) {
      // On Android the plan is not sold in the app (Play billing rules): only explain the limit.
      setError(
        isPlanLimitError(err)
          ? 'Llegaste al límite de 5 progresiones del plan Gratis. Elimina alguna de tu biblioteca para guardar otra.'
          : err instanceof Error
            ? err.message
            : 'No se pudo guardar',
      );
    } finally {
      setSaving(false);
    }
  }

  function addChord(chord: string) {
    clearGeneratedOutput();
    setProgression((current) => [...current, chord]);
  }

  function removeChord(index: number) {
    clearGeneratedOutput();
    setProgression((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function analyze() {
    if (progression.length < 2) return;
    setLoading('analysis');
    setError(null);
    try {
      const response = await analyzeProgression(progression);
      setAnalysis(response.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo analizar');
    } finally {
      setLoading(null);
    }
  }

  async function makeTablature() {
    if (progression.length === 0) return;
    setLoading('tablature');
    setError(null);
    try {
      const response = await generateTablature(name, progression);
      setTablature(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la tablatura');
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Editor</Text>
          <Text style={styles.title}>Arma, analiza y convierte progresiones en tablatura.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nombre de la progresión" />

          <Text style={styles.label}>Tu progresión</Text>
          <View style={styles.progressionRow}>
            {progression.map((chord, index) => (
              <Pressable key={`${chord}-${index}`} onPress={() => removeChord(index)} style={styles.progressionChip}>
                <Text style={styles.progressionText}>{chord}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.helper}>Toca un acorde para quitarlo. Agrega acordes rápidos abajo.</Text>
          <View style={styles.quickGrid}>
            {quickChords.map((chord) => (
              <Pressable key={chord} onPress={() => addChord(chord)} style={styles.quickChip}>
                <Text style={styles.quickText}>{chord}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={analyze}
              disabled={progression.length < 2 || loading !== null}
              style={[styles.secondaryButton, (progression.length < 2 || loading !== null) && styles.disabled]}
            >
              {loading === 'analysis' ? <ActivityIndicator color={cw.ink} /> : <Text style={styles.secondaryButtonText}>Ver tensión</Text>}
            </Pressable>
            <Pressable
              onPress={makeTablature}
              disabled={progression.length === 0 || loading !== null}
              style={[styles.primaryButton, (progression.length === 0 || loading !== null) && styles.disabled]}
            >
              {loading === 'tablature' ? <ActivityIndicator color={cw.canvas} /> : <Text style={styles.primaryButtonText}>Generar tablatura</Text>}
            </Pressable>
          </View>
        </View>

        {accountsEnabled && progression.length > 0 && (
          <Pressable onPress={save} disabled={saving} style={[styles.saveButton, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color={cw.canvas} /> : <Text style={styles.primaryButtonText}>{user ? 'Guardar en mi biblioteca' : 'Entrar para guardar'}</Text>}
          </Pressable>
        )}
        {saved && (
          <Pressable onPress={() => router.push('/biblioteca')}>
            <Text style={styles.savedText}>{saved} · Ver biblioteca</Text>
          </Pressable>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {analysis && (
          <View style={styles.card}>
            <Text style={styles.label}>Tonalidad</Text>
            <Text style={styles.analysisScore}>{analysis.key.label}</Text>
            <View style={styles.degreeRow}>
              {analysis.degrees.map((degree, index) => (
                <View key={`${degree.input}-${index}`} style={[styles.degreeChip, { borderTopColor: functionColor(degree.function, degree.role) }]}>
                  <Text style={styles.degreeChord}>{degree.input}</Text>
                  <Text style={[styles.degreeNumeral, { color: functionColor(degree.function, degree.role) }]}>{degree.numeral}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.label}>Curva de tensión</Text>
            <Text style={styles.analysisScore}>Fluidez promedio: {analysis.averageScore}</Text>
            <Text style={styles.helper}>{analysis.suggestions.join(' ')}</Text>
            {analysis.tensionCurve.map((point) => (
              <View key={`${point.from}-${point.to}`} style={styles.tensionRow}>
                <Text style={styles.tensionText}>{point.from} - {point.to}</Text>
                <Text style={[styles.tensionScore, { color: categoryColor(point.category) }]}>
                  {point.score} - {categoryLabel(point.category)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!tablature} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTablature(null)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.eyebrow}>Tablatura</Text>
            <Text style={styles.modalTitle}>{tablature?.title}</Text>
            <Text selectable style={styles.tabText}>{tablature?.text}</Text>
            <Pressable onPress={() => setTablature(null)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Cerrar</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cw.canvasSoft },
  content: { gap: 18, padding: 18, paddingBottom: 96 },
  header: { backgroundColor: cw.teal, borderRadius: 24, gap: 12, padding: 24 },
  eyebrow: { color: cw.violet, fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: cw.canvas, fontSize: 32, fontWeight: '800', letterSpacing: -0.8, lineHeight: 35 },
  card: { backgroundColor: cw.canvas, borderColor: cw.hairline, borderRadius: 20, borderWidth: 1, gap: 14, padding: 18 },
  label: { color: cw.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  input: { backgroundColor: cw.canvasSoft, borderColor: cw.hairline, borderRadius: 12, borderWidth: 1, color: cw.ink, fontSize: 16, minHeight: 48, paddingHorizontal: 14 },
  progressionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  progressionChip: { backgroundColor: cw.primary, borderRadius: 999, minHeight: 44, paddingHorizontal: 16, paddingVertical: 12 },
  progressionText: { color: cw.canvas, fontSize: 15, fontWeight: '800' },
  helper: { color: cw.muted, fontSize: 14, lineHeight: 20 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickChip: { backgroundColor: cw.canvasSoft, borderRadius: 999, minHeight: 44, paddingHorizontal: 16, paddingVertical: 12 },
  quickText: { color: cw.ink, fontSize: 14, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryButton: { alignItems: 'center', backgroundColor: cw.primary, borderRadius: 12, justifyContent: 'center', minHeight: 48, paddingHorizontal: 18, paddingVertical: 12 },
  primaryButtonText: { color: cw.canvas, fontSize: 15, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', backgroundColor: cw.canvas, borderColor: cw.hairlineDark, borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: 18, paddingVertical: 12 },
  secondaryButtonText: { color: cw.ink, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  errorText: { color: cw.danger, fontSize: 14, lineHeight: 20 },
  saveButton: { alignItems: 'center', backgroundColor: cw.tealMid, borderRadius: 12, justifyContent: 'center', minHeight: 48, paddingHorizontal: 18 },
  savedText: { color: '#1f8a70', fontSize: 14, fontWeight: '700' },
  analysisScore: { color: cw.ink, fontSize: 20, fontWeight: '800' },
  degreeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  degreeChip: { borderTopWidth: 4, borderRadius: 8, backgroundColor: '#f6f1e7', paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  degreeChord: { color: cw.ink, fontSize: 15, fontWeight: '700' },
  degreeNumeral: { fontSize: 18, fontWeight: '800' },
  tensionRow: { backgroundColor: cw.canvasSoft, borderRadius: 14, gap: 4, padding: 14 },
  tensionText: { color: cw.ink, fontSize: 16, fontWeight: '800' },
  tensionScore: { fontSize: 14, fontWeight: '800' },
  modalSafeArea: { flex: 1, backgroundColor: cw.canvas },
  modalContent: { gap: 16, padding: 18, paddingBottom: 48 },
  modalTitle: { color: cw.ink, fontSize: 28, fontWeight: '800' },
  tabText: { backgroundColor: cw.canvasSoft, borderRadius: 16, color: cw.ink, fontFamily: 'monospace', fontSize: 12, lineHeight: 20, padding: 16 },
});
