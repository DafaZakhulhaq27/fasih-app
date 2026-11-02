/**
 * Android and iOS will use @react-native-google-signin/google-signin and
 * supabase.auth.signInWithIdToken. That module needs a development build (not Expo Go) and the
 * Android OAuth client from Fase 0 step 0, so it is not wired up yet.
 */
export async function signInWithGoogle(): Promise<void> {
  throw new Error(
    'Google sign-in is not available in the mobile app yet. Use the web app for now.',
  );
}
