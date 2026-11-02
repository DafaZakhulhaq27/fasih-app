import type { SupportedStorage } from '@supabase/supabase-js';

// Web: supabase-js keeps the session in localStorage when no storage is given.
// Android and iOS use session-storage.native.ts.
export const authStorage: SupportedStorage | undefined = undefined;
