export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://chords-api-python.vercel.app';

export type Chord = {
  id: string;
  root: string;
  type: string;
  family?: string;
  notes?: string[];
  triad: string[];
  circlePosition: number;
};

export type Connection = {
  target: string;
  score: number;
  category: 'natural' | 'media' | 'tensa' | 'extrema';
};

export type ConnectionsResponse = {
  source: string;
  connections: Connection[];
  total: number;
};

export type Degree = {
  input: string;
  chord: string;
  numeral: string;
  function: 'T' | 'SD' | 'D' | null;
  role: 'diatonic' | 'secondary_dominant' | 'borrowed' | 'chromatic';
  explanation: string;
};

export type AnalyzeResponse = {
  analysis: {
    chords: string[];
    key: { id: string; label: string; detected: boolean; confidence: number };
    degrees: Degree[];
    tensionCurve: { from: string; to: string; score: number; category: Connection['category'] }[];
    averageScore: number;
    suggestions: string[];
  };
};

export type TablatureResponse = {
  title: string;
  chords: string[];
  lines: string[];
  arpeggioLines: string[];
  text: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    });
  } catch {
    throw new Error(`No se pudo conectar con la API publicada en ${API_URL}`);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Error de API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getChords() {
  return request<Chord[]>('/api/v1/chords');
}

export function getConnections(chordId: string, tonality: string) {
  const id = encodeURIComponent(chordId);
  const key = encodeURIComponent(tonality);
  return request<ConnectionsResponse>(
    `/api/v1/chords/${id}/connections?tonality=${key}&min_score=0&max_results=12`,
  );
}

/** Without a tonality the API detects the key from the chords. */
export function analyzeProgression(chords: string[], tonality?: string) {
  return request<AnalyzeResponse>('/api/v1/analyze', {
    method: 'POST',
    body: JSON.stringify({ chords, tonality: tonality || undefined }),
  });
}

export function generateTablature(title: string, chords: string[]) {
  return request<TablatureResponse>('/api/v1/tablature', {
    method: 'POST',
    body: JSON.stringify({ title, chords }),
  });
}
