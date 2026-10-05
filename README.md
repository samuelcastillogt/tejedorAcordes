# TejedorApp

Aplicación móvil Expo/React Native para ChordWeaver. Consume el backend publicado en Vercel:

```txt
https://chords-api-python.vercel.app
```

Para usar una API local define `EXPO_PUBLIC_API_URL` (por ejemplo `EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 npx expo start`).

El análisis de progresiones ya no fija la tonalidad en C: la API la detecta y la app muestra la tonalidad y el grado romano de cada acorde con el color de su función armónica (verde tónica, ámbar subdominante, rojo dominante, violeta prestado), el mismo código de color que la web.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

La pantalla principal esta en `src/screens/Home.tsx` y se expone desde `src/app/index.tsx`. La ruta `src/app/tabs.tsx` contiene el editor de progresiones, analisis de tension y generacion de tablatura.

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

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
