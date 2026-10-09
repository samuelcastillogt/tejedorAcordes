import { Fraunces_600SemiBold, Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { color } from '@/constants/theme';
import { PlaybackProvider } from '@/lib/audio/playback';
import { AuthProvider } from '@/lib/auth';
import { CatalogProvider } from '@/lib/catalog';
import { ProgressionProvider } from '@/lib/progression';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <CatalogProvider>
        <ProgressionProvider>
          <PlaybackProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.paper } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="acorde/[id]"
                options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.85, 1], sheetCornerRadius: 24, contentStyle: { backgroundColor: color.card } }}
              />
              <Stack.Screen name="tablatura" options={{ presentation: 'modal', contentStyle: { backgroundColor: color.card } }} />
              <Stack.Screen name="cuenta" options={{ presentation: 'modal', contentStyle: { backgroundColor: color.paper } }} />
            </Stack>
          </PlaybackProvider>
        </ProgressionProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
