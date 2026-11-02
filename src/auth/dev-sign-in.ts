import { getEnv } from '@/lib/env';
import { isLocalUrl } from '@/lib/local-url';
import { supabase } from '@/lib/supabase';

// Local development only: lets the app be used against `supabase start` before Google OAuth exists,
// and gives E2E tests a sign-in that needs no Google account. The account lives only in the local
// database; dev@example.test is invited by supabase/seed.sql, so the invite hook still applies.
const DEV_EMAIL = 'dev@example.test';
const DEV_PASSWORD = 'local-dev-only-password';

/** Shown only in development builds that talk to a Supabase on this machine or LAN. */
export const devSignInAvailable: boolean = __DEV__ && isLocalUrl(getEnv().EXPO_PUBLIC_SUPABASE_URL);

export async function devSignIn(): Promise<void> {
  if (!devSignInAvailable) {
    throw new Error('Dev sign-in only works against a local Supabase in a development build.');
  }
  const signIn = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
  });
  if (!signIn.error) {
    return;
  }
  if (signIn.error.code !== 'invalid_credentials') {
    throw signIn.error;
  }
  // First use on this database: create the account. Email confirmation is off locally.
  const signUp = await supabase.auth.signUp({ email: DEV_EMAIL, password: DEV_PASSWORD });
  if (signUp.error) {
    throw signUp.error;
  }
}
