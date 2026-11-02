import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type ReactElement, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

type SessionState = {
  session: Session | null;
  /** True until the stored session (or the OAuth code in the URL) has been read. */
  isLoading: boolean;
};

const SessionContext = createContext<SessionState>({ session: null, isLoading: true });

export function SessionProvider({ children }: { children: ReactNode }): ReactElement {
  const [state, setState] = useState<SessionState>({ session: null, isLoading: true });

  useEffect(() => {
    // Fires INITIAL_SESSION first, then on every sign-in, sign-out and token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isLoading: false });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <SessionContext value={state}>{children}</SessionContext>;
}

export function useSession(): SessionState {
  return use(SessionContext);
}
