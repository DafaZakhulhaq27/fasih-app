import { supabase } from '@/lib/supabase';

/** Web: redirects to Google through Supabase Auth (PKCE). The page reloads on the way back. */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    // Back to the sign-in screen, so a rejected sign-up (no invite) can show its error there.
    options: { redirectTo: `${window.location.origin}/sign-in` },
  });
  if (error) {
    throw error;
  }
}
