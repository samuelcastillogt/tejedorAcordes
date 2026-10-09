import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { analyzeProgression, AnalyzeResponse } from '@/lib/api';
import { moveItem, transposeChord } from '@/lib/music/theory';

const STORAGE_KEY = 'cw.progression.v1';
const SETTINGS_KEY = 'cw.settings.v1';

export type Analysis = AnalyzeResponse['analysis'];
export type Labels = 'chords' | 'numerals';

type Stored = { name: string; chords: string[]; tonality: string | null; savedId: string | null };
type Settings = { labels: Labels; latin: boolean; bpm: number; loop: boolean; capo: number };

type ProgressionValue = Stored &
  Settings & {
    analysis: Analysis | null;
    analyzing: boolean;
    analysisError: string | null;
    setName: (name: string) => void;
    add: (chord: string) => void;
    addMany: (chords: string[]) => void;
    removeAt: (index: number) => void;
    move: (from: number, to: number) => void;
    replaceAt: (index: number, chord: string) => void;
    /** Loads a whole progression (a preset, a saved one or one typed in). */
    load: (progression: { name?: string; chords: string[]; tonality?: string | null; savedId?: string | null }) => void;
    clear: () => void;
    /** Moves every chord (and a fixed key) by semitones. */
    transpose: (semitones: number) => void;
    setTonality: (tonality: string | null) => void;
    setSavedId: (id: string | null) => void;
    analyze: () => Promise<void>;
    update: (settings: Partial<Settings>) => void;
  };

const ProgressionContext = createContext<ProgressionValue | null>(null);

const EMPTY: Stored = { name: 'Mi progresión', chords: [], tonality: null, savedId: null };
const DEFAULT_SETTINGS: Settings = { labels: 'chords', latin: false, bpm: 96, loop: true, capo: 0 };

/**
 * The progression being worked on, shared by every tab (built in Explorar, read in Analizar,
 * looked up in Acordes) and kept on the device between sessions. The analysis follows it.
 */
export function ProgressionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(EMPTY);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const restored = useRef(false);
  const request = useRef(0);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(SETTINGS_KEY)])
      .then(([stored, storedSettings]) => {
        if (stored) setState({ ...EMPTY, ...JSON.parse(stored) });
        if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      })
      .catch(() => undefined)
      .finally(() => {
        restored.current = true;
      });
  }, []);

  useEffect(() => {
    if (restored.current) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state]);

  useEffect(() => {
    if (restored.current) void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => undefined);
  }, [settings]);

  // Any change to the chords or the key makes the previous analysis stale.
  const change = useCallback((next: (current: Stored) => Stored) => {
    request.current += 1;
    setState(next);
    setAnalysis(null);
    setAnalysisError(null);
  }, []);

  const analyze = useCallback(async () => {
    const id = (request.current += 1);
    if (state.chords.length < 2) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await analyzeProgression(state.chords, state.tonality ?? undefined);
      if (id === request.current) setAnalysis(response.analysis);
    } catch (err) {
      if (id === request.current) setAnalysisError(err instanceof Error ? err.message : 'No se pudo analizar');
    } finally {
      if (id === request.current) setAnalyzing(false);
    }
  }, [state.chords, state.tonality]);

  // Analyse on its own shortly after the chords or the key change: on a phone the result should
  // simply be there, without hunting for a button.
  useEffect(() => {
    if (state.chords.length < 2) return;
    const timeout = setTimeout(() => void analyze(), 500);
    return () => clearTimeout(timeout);
  }, [state.chords, state.tonality, analyze]);

  const value = useMemo<ProgressionValue>(
    () => ({
      ...state,
      ...settings,
      analysis,
      analyzing,
      analysisError,
      setName: (name) => setState((current) => ({ ...current, name })),
      add: (chord) => change((current) => ({ ...current, chords: [...current.chords, chord] })),
      addMany: (chords) => change((current) => ({ ...current, chords: [...current.chords, ...chords] })),
      removeAt: (index) => change((current) => ({ ...current, chords: current.chords.filter((_, i) => i !== index) })),
      move: (from, to) => change((current) => ({ ...current, chords: moveItem(current.chords, from, to) })),
      replaceAt: (index, chord) =>
        change((current) => ({ ...current, chords: current.chords.map((item, i) => (i === index ? chord : item)) })),
      load: ({ name, chords, tonality = null, savedId = null }) =>
        change(() => ({ name: name?.trim() || 'Mi progresión', chords, tonality, savedId })),
      clear: () => change(() => EMPTY),
      transpose: (semitones) =>
        change((current) => ({
          ...current,
          chords: current.chords.map((chord) => transposeChord(chord, semitones)),
          tonality: current.tonality ? transposeChord(current.tonality, semitones) : null,
        })),
      setTonality: (tonality) => change((current) => ({ ...current, tonality })),
      setSavedId: (savedId) => setState((current) => ({ ...current, savedId })),
      analyze,
      update: (partial) => setSettings((current) => ({ ...current, ...partial })),
    }),
    [state, settings, analysis, analyzing, analysisError, change, analyze],
  );

  return <ProgressionContext value={value}>{children}</ProgressionContext>;
}

export function useProgression(): ProgressionValue {
  const context = use(ProgressionContext);
  if (!context) throw new Error('useProgression must be used inside ProgressionProvider');
  return context;
}
