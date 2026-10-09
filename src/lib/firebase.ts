import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

/**
 * Firebase web config (the same project as the website). These values are public: they identify
 * the project, they do not grant access. They come from EXPO_PUBLIC_FIREBASE_* (see .env.example
 * and eas.json); without them the app runs without accounts.
 */
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

let auth: Auth | null = null;

/** Firebase Auth with the session kept in AsyncStorage, or null when Firebase is not configured. */
export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (auth) return auth;
  const app = getApps().length ? getApp() : initializeApp(config);
  try {
    // The web build (expo start --web) keeps Firebase's own browser persistence.
    auth = Platform.OS === 'web' ? getAuth(app) : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Fast refresh re-runs this module after Auth was already initialized.
    auth = getAuth(app);
  }
  auth.languageCode = 'es';
  return auth;
}
