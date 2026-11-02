import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./supabase/functions/_shared/core', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Only pure TypeScript modules: nothing here may import React Native.
    include: [
      'supabase/functions/_shared/core/**/*.test.ts',
      'src/**/*.test.ts',
      'prompts/**/*.test.ts',
    ],
  },
});
