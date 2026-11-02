import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';
import { getEnv } from './env';
import { authStorage } from './session-storage';

const env = getEnv();

export const supabase = createClient<Database>(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      // On the web, Google redirects back with ?code=..., which supabase-js exchanges for a session.
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
      // The web uses navigator.locks by default; native has no equivalent, so serialize auth
      // operations in-process to stop two refreshes from spending the same refresh token.
      lock: Platform.OS === 'web' ? undefined : processLock,
    },
  },
);

// Native apps refresh the session only while they are in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
