export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://chords-api-python.vercel.app';

export type Chord = {
  id: string;
  root: string;
  type: string;
  family?: string;
  label?: string;
  notes?: string[];
  triad: string[];
  circlePosition: number;
};

export type Criterion = { raw: number; weighted: number; detail: string };

export type Connection = {
  target: string;
  score: number;
  category: 'natural' | 'media' | 'tensa' | 'extrema';
  breakdown: Record<string, Criterion>;
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
  approximated?: boolean;
  substitutions?: { chord: string; kind: string; reason: string }[];
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
  tuning: string[];
  chords: string[];
  lines: string[];
  arpeggioLines: string[];
  text: string;
  /** One diagram per chord; frets go from the high e string to the low E ("x" = muted). */
  diagrams: { chord: string; frets: string[] }[];
};

export type ParsedChord = { input: string; chord: string | null; bass: string | null; approximated: boolean; error: string | null };

export function parseChords(symbols: string[]) {
  return request<{ results: ParsedChord[] }>('/api/v1/chords/parse', { method: 'POST', body: JSON.stringify({ symbols }) });
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Returns the signed-in user's Firebase ID token (`forceRefresh` asks for a new one), or null. */
type TokenProvider = (forceRefresh?: boolean) => Promise<string | null>;
let tokenProvider: TokenProvider = async () => null;

/** The auth layer registers how to get the current token; this module stays auth-agnostic. */
export function setTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider ?? (async () => null);
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const body = JSON.parse(text);
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) return body.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join('. ');
  } catch {
    // Not JSON: use the raw text.
  }
  return text || `Error de la API: ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const token = await tokenProvider(retried);
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError('No hay conexión con ChordWeaver. Revisa tu internet e inténtalo de nuevo.', 0);
  }

  // An expired token gets one retry with a freshly issued one.
  if (response.status === 401 && token && !retried) return request<T>(path, init, true);
  if (!response.ok) throw new ApiError(await readError(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getChords() {
  return request<Chord[]>('/api/v1/chords');
}

export function getConnections(chordId: string, tonality: string) {
  const id = encodeURIComponent(chordId);
  const key = encodeURIComponent(tonality);
  return request<ConnectionsResponse>(`/api/v1/chords/${id}/connections?tonality=${key}&min_score=0&max_results=40`);
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

// --- Accounts ---------------------------------------------------------------

export type PlanId = 'free' | 'pro' | 'lifetime';

export type User = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  plan: PlanId;
};

export type Progression = {
  id: string;
  name: string;
  chords: string[];
  tonality: string | null;
  isPublic: boolean;
  isOwner: boolean;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  plan: PlanId;
  planName: string;
  period: 'monthly' | 'yearly' | 'once' | null;
  provider: string | null;
  renewsAt: string | null;
  saved: number;
  saveLimit: number | null;
};

export function getHealth() {
  return request<{ accounts?: boolean }>('/health');
}

export function getMe() {
  return request<User>('/api/v1/auth/me');
}

export function updateMe(displayName: string) {
  return request<User>('/api/v1/auth/me', { method: 'PATCH', body: JSON.stringify({ displayName }) });
}

export function deleteMe() {
  return request<void>('/api/v1/auth/me', { method: 'DELETE' });
}

export function getSubscription() {
  return request<Subscription>('/api/v1/billing/subscription');
}

export function listProgressions() {
  return request<{ progressions: Progression[]; total: number }>('/api/v1/progressions');
}

export function updateProgression(id: string, body: { name?: string; chords?: string[]; tonality?: string | null; isPublic?: boolean }) {
  return request<Progression>(`/api/v1/progressions/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });
}

export function saveProgression(body: { name: string; chords: string[]; tonality?: string | null }) {
  return request<Progression>('/api/v1/progressions', {
    method: 'POST',
    body: JSON.stringify({ ...body, source: 'app-movil' }),
  });
}

export function deleteProgression(id: string) {
  return request<void>(`/api/v1/progressions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** The API answers 402 when the Gratis plan reaches its saved-progressions limit. */
export function isPlanLimitError(error: unknown) {
  return error instanceof ApiError && error.status === 402;
}
