import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react';

import { Chord, getChords } from '@/lib/api';

const CACHE_KEY = 'cw.catalog.v1';

type CatalogValue = {
  chords: Chord[];
  byId: Map<string, Chord>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  /** Note names of a chord id ("Bm" -> ["B", "D", "F#"]); empty if unknown. */
  notesOf: (id: string) => string[];
};

const CatalogContext = createContext<CatalogValue | null>(null);

/** The 192-chord catalog: fetched once, cached on the device so the app opens offline. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [chords, setChords] = useState<Chord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(CACHE_KEY)
      .then((cached) => {
        if (cached && !cancelled) setChords((current) => (current.length ? current : JSON.parse(cached)));
      })
      .catch(() => undefined);
    getChords()
      .then((fresh) => {
        if (cancelled) return;
        setChords(fresh);
        setError(null);
        void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => undefined);
      })
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo(() => {
    const byId = new Map(chords.map((chord) => [chord.id, chord]));
    return {
      chords,
      byId,
      loading: loading && chords.length === 0,
      error: chords.length ? null : error,
      reload,
      notesOf: (id: string) => byId.get(id)?.notes ?? byId.get(id)?.triad ?? [],
    };
  }, [chords, loading, error, reload]);

  return <CatalogContext value={value}>{children}</CatalogContext>;
}

export function useCatalog(): CatalogValue {
  const context = use(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}
