# Shared core

Pure TypeScript shared by the app, the Edge Functions and the Vitest unit tests: band rounding, text metrics, Zod schemas, the FSRS wrapper.

- The app imports it as `@core/*` (see `tsconfig.json` and `vitest.config.ts`).
- Do not import React, React Native, Expo, Node or Deno APIs here. ESLint enforces this with `no-restricted-imports`.
- Edge Functions map bare imports such as `zod` to `npm:` specifiers in their `deno.json`.
- Put tests next to the code as `*.test.ts`.
