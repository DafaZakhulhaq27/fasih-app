import { z } from 'zod';

// Only public values: everything prefixed EXPO_PUBLIC_ ends up in the app bundle.
const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // Needed for Google sign-in on Android (Fase 0 step 3); web sign-in goes through Supabase.
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, string | undefined>): Env {
  // Treat empty values (`KEY=` copied from .env.example) as missing.
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, value?.trim() || undefined]),
  );
  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    throw new Error(
      `Invalid environment. Copy .env.example to .env.local and fill it in.\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  // Expo inlines EXPO_PUBLIC_ variables only when they are read as `process.env.NAME`.
  cached ??= parseEnv({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  return cached;
}
