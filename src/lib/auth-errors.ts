/** Spanish messages for the Firebase Auth errors users can actually run into (same as the website). */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'Ese email no es válido.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email. Inicia sesión o recupera tu contraseña.',
  'auth/weak-password': 'La contraseña es muy débil: usa al menos 8 caracteres.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  'auth/operation-not-allowed': 'Ese método de inicio de sesión no está activado.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión y repite la acción.',
};

export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code : null;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return error instanceof Error && error.message ? error.message : 'No se pudo completar. Inténtalo de nuevo.';
}
