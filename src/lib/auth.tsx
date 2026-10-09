import {
  createUserWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser,
  onIdTokenChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { deleteMe, getHealth, getMe, setTokenProvider, updateMe, User } from '@/lib/api';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

/** Firebase deletes an account only within a few minutes of signing in. */
const RECENT_LOGIN_MS = 4 * 60 * 1000;

export class RecentLoginRequiredError extends Error {
  constructor() {
    super('Por seguridad, vuelve a iniciar sesión y luego elimina la cuenta.');
  }
}

type AuthContextValue = {
  /** The API user, present once Firebase signed in and the API accepted the token. */
  user: User | null;
  /** Firebase finished restoring the saved session. */
  ready: boolean;
  /** Firebase is configured in this build and the API has accounts enabled. */
  accountsEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
  /** Deletes the user's data in the API and the Firebase account (needs a recent sign-in). */
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Las cuentas no están disponibles en esta versión de la app.');
  return auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isFirebaseConfigured);
  const [apiAccounts, setApiAccounts] = useState(true);

  useEffect(() => {
    getHealth()
      .then((health) => setApiAccounts(health.accounts !== false))
      .catch(() => undefined);
  }, []);

  const syncWithApi = useCallback(async (current: FirebaseUser | null) => {
    if (!current) {
      setUser(null);
      return;
    }
    try {
      setUser(await getMe());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setTokenProvider(async (forceRefresh) => (auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : null));
    let lastUid: string | null | undefined;
    const unsubscribe = onIdTokenChanged(auth, async (current) => {
      if (current?.uid !== lastUid) {
        lastUid = current?.uid ?? null;
        await syncWithApi(current);
      }
      setReady(true);
    });
    return () => {
      unsubscribe();
      setTokenProvider(null);
    };
  }, [syncWithApi]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      accountsEnabled: isFirebaseConfigured && apiAccounts,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
      },
      signUp: async (email, password, displayName) => {
        const credential = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
        const name = displayName?.trim();
        if (name) {
          await updateProfile(credential.user, { displayName: name });
          // The sign-in event may have created the API user without a name: set it, then re-read.
          await updateMe(name);
          await syncWithApi(credential.user);
        }
        await sendEmailVerification(credential.user);
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(requireAuth(), email.trim());
      },
      logout: async () => {
        await signOut(requireAuth());
      },
      reloadUser: async () => {
        await syncWithApi(requireAuth().currentUser);
      },
      deleteAccount: async () => {
        const current = requireAuth().currentUser;
        if (!current) return;
        const lastSignIn = Date.parse(current.metadata.lastSignInTime ?? '');
        if (!lastSignIn || Date.now() - lastSignIn > RECENT_LOGIN_MS) throw new RecentLoginRequiredError();
        await deleteMe();
        await deleteUser(current);
      },
    }),
    [user, ready, apiAccounts, syncWithApi],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
