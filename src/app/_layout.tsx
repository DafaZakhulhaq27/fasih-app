import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactElement } from 'react';

import { SessionProvider, useSession } from '@/auth/session-provider';
import { queryClient } from '@/lib/query-client';
import { colors, fontAssets } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}

function RootNavigator(): ReactElement | null {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { session, isLoading } = useSession();
  // If a font fails to load, render anyway with the system font.
  const ready = (fontsLoaded || fontError !== null) && !isLoading;
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (fontError) {
      console.warn('Fonts failed to load; falling back to the system font.', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // Cached rows belong to one user; drop them when the user changes or signs out.
  useEffect(() => {
    queryClient.clear();
  }, [userId]);

  if (!ready) {
    return null;
  }

  const signedIn = session !== null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/sign-in" />
      </Stack.Protected>
    </Stack>
  );
}
