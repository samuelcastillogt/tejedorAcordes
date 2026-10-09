import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cw } from '@/constants/chordweaver-theme';
import { WEB_URL } from '@/constants/links';
import { getSubscription, Subscription } from '@/lib/api';
import { RecentLoginRequiredError, useAuth } from '@/lib/auth';
import { authErrorMessage } from '@/lib/auth-errors';

type Mode = 'login' | 'register' | 'reset';

const COPY: Record<Mode, { title: string; submit: string }> = {
  login: { title: 'Entra a tu cuenta', submit: 'Entrar' },
  register: { title: 'Crea tu cuenta gratis', submit: 'Crear cuenta' },
  reset: { title: 'Recupera tu contraseña', submit: 'Enviar enlace' },
};

function openWeb(path: string) {
  void WebBrowser.openBrowserAsync(`${WEB_URL}${path}`);
}

function SignInForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'login') await signIn(email, password);
      if (mode === 'register') {
        await signUp(email, password, name);
        setNotice(`Cuenta creada. Te enviamos un correo a ${email.trim()} para verificarla.`);
      }
      if (mode === 'reset') {
        await resetPassword(email);
        setNotice(`Si existe una cuenta con ${email.trim()}, te llegará un correo para cambiar la contraseña.`);
      }
      setPassword('');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{COPY[mode].title}</Text>
      <Text style={styles.helper}>Guarda tus progresiones y ábrelas también en la web.</Text>
      {mode === 'register' && (
        <TextInput value={name} onChangeText={setName} placeholder="Tu nombre (opcional)" autoComplete="name" style={styles.input} placeholderTextColor={cw.muted} />
      )}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={styles.input}
        placeholderTextColor={cw.muted}
      />
      {mode !== 'reset' && (
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={mode === 'register' ? 'Contraseña (mínimo 8 caracteres)' : 'Contraseña'}
          secureTextEntry
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          style={styles.input}
          placeholderTextColor={cw.muted}
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {notice && <Text style={styles.noticeText}>{notice}</Text>}
      <Pressable onPress={submit} disabled={pending} style={[styles.primaryButton, pending && styles.disabled]}>
        {pending ? <ActivityIndicator color={cw.canvas} /> : <Text style={styles.primaryButtonText}>{COPY[mode].submit}</Text>}
      </Pressable>
      <View style={styles.linkRow}>
        {mode !== 'login' && (
          <Pressable onPress={() => switchMode('login')} hitSlop={8}>
            <Text style={styles.link}>Ya tengo cuenta</Text>
          </Pressable>
        )}
        {mode !== 'register' && (
          <Pressable onPress={() => switchMode('register')} hitSlop={8}>
            <Text style={styles.link}>Crear cuenta</Text>
          </Pressable>
        )}
        {mode === 'login' && (
          <Pressable onPress={() => switchMode('reset')} hitSlop={8}>
            <Text style={styles.link}>Olvidé mi contraseña</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.legal}>
        Al crear una cuenta aceptas los{' '}
        <Text style={styles.link} onPress={() => openWeb('/terminos/')}>
          términos
        </Text>{' '}
        y la{' '}
        <Text style={styles.link} onPress={() => openWeb('/privacidad/')}>
          política de privacidad
        </Text>
        .
      </Text>
    </View>
  );
}

export default function Account() {
  const { user, ready, accountsEnabled, logout, deleteAccount } = useAuth();
  // Keyed by user so a previous user's plan is never shown after switching accounts.
  const [loaded, setLoaded] = useState<{ userId: string; subscription: Subscription } | null>(null);
  const subscription = user && loaded?.userId === user.id ? loaded.subscription : null;
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getSubscription()
      .then((result) => !cancelled && setLoaded({ userId: user.id, subscription: result }))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function removeAccount() {
    setDeleting(true);
    setMessage(null);
    try {
      await deleteAccount();
      setMessage('Tu cuenta y tus datos se eliminaron.');
    } catch (err) {
      if (err instanceof RecentLoginRequiredError) {
        await logout();
        setMessage(err.message);
      } else {
        setMessage(authErrorMessage(err));
      }
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      '¿Eliminar tu cuenta?',
      `Se borrarán ${subscription ? `tus ${subscription.saved} progresiones, ` : ''}tu plan y tu acceso. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void removeAccount() },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12}>
          <Text style={styles.back}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Cuenta</Text>
        <Text style={styles.title}>{user?.displayName || 'Mi cuenta'}</Text>

        {message && <Text style={styles.noticeText}>{message}</Text>}

        {!ready ? (
          <ActivityIndicator color={cw.primary} />
        ) : !accountsEnabled ? (
          <View style={styles.card}>
            <Text style={styles.helper}>Las cuentas no están disponibles en este momento.</Text>
          </View>
        ) : !user ? (
          <SignInForm />
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
              <Text style={styles.label}>Plan</Text>
              <Text style={styles.value}>
                {subscription?.planName ?? (user.plan === 'free' ? 'Gratis' : user.plan === 'pro' ? 'Pro' : 'Vitalicio fundador')}
              </Text>
              {subscription && (
                <Text style={styles.helper}>
                  {subscription.saveLimit
                    ? `${subscription.saved} de ${subscription.saveLimit} progresiones guardadas`
                    : `${subscription.saved} progresiones guardadas · sin límite`}
                </Text>
              )}
              <Pressable onPress={() => router.push('/biblioteca')} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Ver mis progresiones</Text>
              </Pressable>
              <Pressable onPress={() => void logout()} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
              </Pressable>
            </View>

            <View style={[styles.card, styles.dangerCard]}>
              <Text style={styles.cardTitle}>Eliminar mi cuenta</Text>
              <Text style={styles.helper}>Borra tu cuenta, tu plan y todas tus progresiones. No se puede deshacer.</Text>
              <Pressable onPress={confirmDelete} disabled={deleting} style={[styles.dangerButton, deleting && styles.disabled]}>
                {deleting ? <ActivityIndicator color={cw.danger} /> : <Text style={styles.dangerButtonText}>Eliminar mi cuenta</Text>}
              </Pressable>
            </View>
          </>
        )}

        <View style={styles.linkRow}>
          <Pressable onPress={() => openWeb('/privacidad/')} hitSlop={8}>
            <Text style={styles.link}>Privacidad</Text>
          </Pressable>
          <Pressable onPress={() => openWeb('/terminos/')} hitSlop={8}>
            <Text style={styles.link}>Términos</Text>
          </Pressable>
          <Pressable onPress={() => openWeb('/eliminar-cuenta/')} hitSlop={8}>
            <Text style={styles.link}>Cómo se eliminan los datos</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cw.canvasSoft },
  content: { gap: 16, padding: 18, paddingBottom: 64 },
  back: { color: cw.primary, fontSize: 16, fontWeight: '700' },
  eyebrow: { color: cw.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: cw.ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  card: { backgroundColor: cw.canvas, borderColor: cw.hairline, borderRadius: 20, borderWidth: 1, gap: 12, padding: 18 },
  dangerCard: { borderColor: '#f2c8c3' },
  cardTitle: { color: cw.ink, fontSize: 22, fontWeight: '800' },
  label: { color: cw.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  value: { color: cw.ink, fontSize: 18, fontWeight: '700' },
  helper: { color: cw.muted, fontSize: 14, lineHeight: 20 },
  input: { backgroundColor: cw.canvasSoft, borderColor: cw.hairline, borderRadius: 12, borderWidth: 1, color: cw.ink, fontSize: 16, minHeight: 48, paddingHorizontal: 14 },
  primaryButton: { alignItems: 'center', backgroundColor: cw.primary, borderRadius: 12, justifyContent: 'center', minHeight: 48, paddingHorizontal: 18 },
  primaryButtonText: { color: cw.canvas, fontSize: 15, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', borderColor: cw.hairline, borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 48 },
  secondaryButtonText: { color: cw.ink, fontSize: 15, fontWeight: '700' },
  dangerButton: { alignItems: 'center', borderColor: cw.danger, borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 48 },
  dangerButtonText: { color: cw.danger, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  link: { color: cw.primary, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  legal: { color: cw.muted, fontSize: 12, lineHeight: 18 },
  errorText: { color: cw.danger, fontSize: 14, lineHeight: 20 },
  noticeText: { color: '#1f8a70', fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
