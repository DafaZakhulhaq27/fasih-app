// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts'],
  },
  {
    // Shared core runs in the app, in Edge Functions (Deno) and in Vitest,
    // so it must stay free of platform-specific imports.
    files: ['supabase/functions/_shared/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react/*', 'expo', 'expo-*', '@expo/*'],
              message: '_shared/core must not import React, React Native or Expo.',
            },
            {
              group: ['node:*', 'fs', 'path', 'npm:*', 'jsr:*', 'http://*', 'https://*'],
              message: '_shared/core must not import Node or Deno APIs.',
            },
          ],
        },
      ],
    },
  },
]);
