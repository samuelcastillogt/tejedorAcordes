# ChordWeaver (app móvil)

Aplicación móvil Expo/React Native de ChordWeaver (`com.samuelcastillo.chordweaver`). Consume el backend publicado en Vercel:

```txt
https://chords-api-python.vercel.app
```

Para usar una API local define `EXPO_PUBLIC_API_URL` (por ejemplo `EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 npx expo start`).

El análisis de progresiones ya no fija la tonalidad en C: la API la detecta y la app muestra la tonalidad y el grado romano de cada acorde con el color de su función armónica (verde tónica, ámbar subdominante, rojo dominante, violeta pre## Desarrollo

```bash
npm install
cp .env.example .env.local   # completa EXPO_PUBLIC_FIREBASE_* (los mismos valores que la web)
npx expo start
```

Sin las variables de Firebase la app funciona igual, pero sin cuentas.

## Cuentas

La app usa la misma cuenta que la web (Firebase Authentication con correo y contraseña; la sesión se guarda en AsyncStorage). `src/lib/auth.tsx` registra en el cliente de la API cómo obtener el ID token y pide el usuario a `GET /api/v1/auth/me`.

- **Biblioteca** (`/biblioteca`): progresiones guardadas en la app o en la web.
- **Mi cuenta** (`/cuenta`): registro, inicio de sesión, recuperar contraseña, plan, cerrar sesión y **eliminar la cuenta** (lo exige Google Play).
- En Android no se venden planes dentro de la app (Play exige su facturación): al llegar al límite del plan Gratis la app solo lo explica.

## Build y publicación (EAS)

```bash
npx eas-cli build --platform android --profile production   # AAB firmado para Play
npx eas-cli build --platform android --profile preview      # APK para instalar directo
```

`eas.json` define la API de producción y la configuración pública de Firebase para cada perfil. La llave de firma la genera y guarda EAS (descárgala como respaldo con `npx eas-cli credentials`). El material para Play Console (ficha, gráficos, formularios de contenido y seguridad de datos) está en [`store/PLAY_STORE.md`](store/PLAY_STORE.md).

alisis de tension y generacion de tablatura.

## Verification

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform ios --output-dir /tmp/tejedorapp-ios-check --clear
npx expo export --platform android --output-dir /tmp/tejedorapp-android-check --clear
```

## Startup Stability Notes

- Las pantallas reutilizables viven fuera de `src/app`, para que Expo Router no registre rutas internas accidentales.
- El layout raiz se mantiene como `Stack` simple sin overlay animado de Reanimated/Worklets, evitando cierres silenciosos durante el arranque.
- Si la app se cierra antes de renderizar, revisa `.expo/dev/logs/start.log` y corre los comandos de exportacion para forzar diagnosticos de bundling.
