# Shared core

Pure TypeScript shared by the app, the Edge Functions and the Vitest unit tests: band rounding, text metrics, Zod schemas, the FSRS wrapper.

- The app imports it as `@core/*` (see `tsconfig.json` and `vitest.config.ts`).
- Do not import React, React Native, Expo, Node or Deno APIs here. ESLint enforces this with `no-restricted-imports`.
- Edge Functions map bare imports such as `zod` to `npm:` specifiers in their `deno.json`.
- Write relative imports with the `.ts` extension (`./band.ts`), because Deno requires it. `tsconfig.json` allows it with `allowImportingTsExtensions`.
- Put tests next to the code as `*.test.ts`, and shared test data in `fixtures.ts` (no personal data, no official test material).

| File | What it does |
| --- | --- |
| `band.ts` | Rounds bands to half bands (quarters round up, as for the overall band) and averages them |
| `feedback.ts` | The feedback contract from `docs/plan.md`: Zod schema, JSON Schema for structured output, and `parseFeedback` (lowercases enums, rounds bands) |
| `feedback-prompt.ts` | Reads a `prompts/feedback.v*.md` file (version, system and user sections) and fills its placeholders in one pass, keeping student text from closing the `<question>`/`<answer>` tags |
| `feedback-guard.ts` | Hallucination guard: drops corrections and evidence not found verbatim in the answer, marks criteria without evidence unreliable, applies count limits, reports what it dropped |
