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

## Diseño

La app es una **extensión de la web**, no una copia: usa el mismo sistema visual (`chordsAppWeb/DESIGN.md`) — noche donde se toca y se escucha, papel donde se lee; Fraunces, Inter y JetBrains Mono; el color codifica la función armónica (verde tónica, ámbar subdominante, rojo dominante, violeta prestado) — y suma lo que en el teléfono importa: escuchar, ver cómo se toca y seguir componiendo con una mano.

| Pestaña | Qué hace |
| --- | --- |
| **Analizar** | Escribes o pegas acordes (cifrado americano o latino), eliges con el teclado de acordes o empiezas con un preset. El análisis se hace solo: tonalidad, grado y función de cada acorde, sustituciones, curva de fluidez y lo que cuenta la armonía. Tono, capo, cifrado/grados, guardar, tablatura y compartir. |
| **Explorar** | Qué puede seguir después del último acorde, filtrado como en la web (Segura, Interesante, Atrevida). Cada sugerencia se escucha (el cambio de un acorde al otro) y se agrega con un toque. |
| **Acordes** | Diccionario de los 192 acordes con diagrama de guitarra, piano y sonido; y "¿Qué acorde es?": tocas notas en el piano y te dice qué acordes las contienen. |
| **Biblioteca** | Las progresiones guardadas en la app o en la web. |

Patrones tomados del análisis de competidores (Hookpad, Suggester, Chordify, Cifra Club, TONALY): tarjetas de acorde con color funcional y alternancia cifrado/grados, sugerencias con puntaje que se escuchan antes de agregarlas, barra de reproducción fija que resalta el acorde que suena, tono y capo que recalculan todo, hoja inferior con el diagrama al tocar un acorde, entrada rápida por texto y presets para no empezar en blanco. Sin ventanas emergentes ni bloqueos del plan Gratis más allá del límite de guardado.

### Estructura

```txt
src/app/            rutas (Expo Router): (tabs)/ con NativeTabs, acorde/[id] (hoja), tablatura y cuenta (modales)
src/screens/        pantallas
src/components/     ui (Screen, NightHeader, Card, Button…), chord-card, player-bar, guitar-diagram, piano-keys, fluency-curve, chord-keypad
src/constants/      theme.ts (tokens de la web), links.ts
src/lib/            api.ts, auth.tsx, catalog.tsx (catálogo en caché), progression.tsx (progresión compartida y análisis), audio/ (síntesis WAV + reproducción), music/ (teoría y sugerencias, portadas de la web)
```

El sonido se sintetiza en el teléfono (`src/lib/audio/synth.ts` genera un WAV con armónicos que decaen y rasgueo) y se reproduce con `expo-audio`; funciona sin internet y con el modo silencio de iPhone.

## Cuentas

La app usa la misma cuenta que la web (Firebase Authentication con correo y contraseña; la sesión se guarda en AsyncStorage). `src/lib/auth.tsx` registra en el cliente de la API cómo obtener el ID token y pide el usuario a `GET /api/v1/auth/me`. Desde **Mi cuenta** se puede eliminar la cuenta (lo exige Google Play). En Android no se venden planes dentro de la app (Play exige su facturación): al llegar al límite del plan Gratis la app solo lo explica.

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
