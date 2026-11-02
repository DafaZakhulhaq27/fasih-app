# Fasih

Fasih is an AI-assisted IELTS practice app for iOS, Android and web: daily lessons from a 12-week curriculum, Writing and Speaking practice checked either manually or by AI, a Mistake Bank, and spaced-repetition review. It starts as a personal app and portfolio project, with invite-only sign-up.

## Read first

1. `docs/fase-0.md` — the current work, step by step, with acceptance criteria.
2. `docs/plan.md` — product and architecture source of truth (written in Indonesian). When this file and the plan disagree, the plan wins; flag the conflict.
3. `docs/design/README.md` — screens, tokens and correction marks. PNGs are in `docs/design/screens/`.

## Stack (decided)

- Expo SDK 58 + Expo Router + TypeScript strict. One codebase for iOS, Android and web.
- Supabase: Postgres with Row Level Security, Auth (Google sign-in), Storage (private audio bucket), Edge Functions (Deno).
- Gemini API (free tier), called over REST with `fetch` from Edge Functions only. Model IDs come from env vars.
- Client: TanStack Query for reads, an offline write queue in `expo-sqlite`, `expo-audio` for recording, `ts-fsrs` for scheduling, Zod for validation.
- Package manager: npm, unless there is a concrete reason to change.

Verify version-specific APIs against current docs (Expo SDK 58, Supabase, Gemini) instead of relying on memory. Do not invent APIs.

## Layout

Confirmed in Fase 0 step 1. Routes live in `src/app/`, as in the Expo SDK 58 template.

```
src/
  app/                    Expo Router routes
  theme/                  design tokens: colors, fonts, type sizes, layout values
  components/ hooks/ ...  added when first needed (client data layer, UI)
assets/                   app icon, splash, favicon
supabase/
  migrations/             SQL migrations, RLS policies, RPCs
  functions/
    _shared/core/         pure TypeScript shared with the app
    <function-name>/      one folder per Edge Function
scripts/                  Node scripts: content generation, TTS audio, eval runner
eval/                     golden set runner; eval/private/ is git-ignored
docs/
```

The app imports its own code as `@/*` (-> `src/*`) and shared code through a path alias (`@core/*` -> `supabase/functions/_shared/core/*`). Code in `_shared/core` must not import React Native, Deno or Node APIs, so it runs in the app, in Edge Functions and in Vitest. In Edge Functions, map bare imports such as `zod` to `npm:` specifiers in `deno.json`.

## Rules that do not bend

1. **No secrets in the app.** Only Edge Functions call Gemini. Only public values use the `EXPO_PUBLIC_` prefix (Supabase URL and publishable key, Google web client ID). Server secrets go through `supabase secrets set`. Never commit `.env` files, keystores or service-role keys.
2. **RLS on every table.** The client writes only its own rows. AI results (`feedback`, `mistakes` with `source = 'ai'`, AI band estimates) are written only by Edge Functions. Content tables are readable by signed-in users and writable by admins only.
3. **AI is optional.** Every AI-checked flow has a manual path (self-check). The app must keep working when AI is off (`profiles.ai_enabled = false`), the quota is used up, or the device is offline. Save the attempt with `status = 'pending'` before any AI call so nothing is lost.
4. **Privacy.** No personal data and no real workplace content in prompts, fixtures, seeds, screenshots or commits. Free-tier Gemini may use inputs to improve its models.
5. **Copyright and trademark.** No Cambridge IELTS book content, official test material or verbatim band descriptors in the repo; write rubrics in our own words and link to official sources. Banded sample answers used for eval stay in `eval/private/`. Do not use "IELTS" in the app name, icon or logo.
6. **The model never does arithmetic.** Word counts, WPM, pauses, band averages and rounding are computed in code. Validate every model response with Zod. Drop any correction whose `original` text is not found verbatim in the input, and log it.
7. **Idempotent, offline-safe writes.** IDs are generated on the client (UUID) and written with upsert. A review rating goes through the `record_review` RPC, which checks `review_cards.version`.

## Code standards

- TypeScript strict. No `any` without a comment explaining why. Explicit return types on exported functions.
- Validate untrusted input at every boundary: Edge Function request bodies, model output, environment variables.
- Use the design tokens from `docs/design/README.md`; no ad-hoc colors. Touch targets at least 44pt, labels on inputs, accessible names on icon buttons. Use `start`/`end`, not `left`/`right`.
- Keep changes small: one Fase 0 step per branch or PR. Do not rewrite unrelated code.

## Testing

- Unit tests (Vitest) for `_shared/core`: band rounding, text metrics, Zod schemas, the FSRS wrapper.
- RLS tests against local Supabase (`supabase start`, needs Docker): user A must not read or write user B's rows.
- Edge Functions are tested with recorded Gemini fixtures. Never call live AI in CI.
- E2E: Playwright for the web build; Maestro locally for Android.
- Before saying a step is done: typecheck, lint and tests pass, and the acceptance criteria in `docs/fase-0.md` are checked. Never claim something works without running it.

## Commands

Node 22.13 or newer (see `.nvmrc`). Install with `npm ci`; add Expo packages with `npx expo install <pkg>` so versions match SDK 58.

| Task | Command | Notes |
| --- | --- | --- |
| Dev server | `npm start` | Metro + QR code for Expo Go or a development build |
| Web | `npm run web` | http://localhost:8081 |
| Android | `npm run android` | Needs a device (USB debugging) or an emulator with an Expo Go that supports SDK 58 |
| Typecheck | `npm run typecheck` | `tsc --noEmit` |
| Lint | `npm run lint` | `expo lint --max-warnings 0` (ESLint 9 + Prettier) |
| Format | `npm run format` | `npm run format:check` to check only; Markdown and `docs/` are skipped |
| Unit tests | `npm test` | Vitest, once; `npm run test:watch` to watch |
| Dependency check | `npx expo-doctor` | Expo package versions vs SDK 58 |
| Web build | `npx expo export -p web` | Static SPA in `dist/` (`web.output: single`) |
| Local Supabase | `npm run db:start` / `npm run db:stop` | Needs Docker (OrbStack on this Mac). The CLI is a dev dependency: run it as `npx supabase`. Studio at http://127.0.0.1:54323 |
| New migration | `npx supabase migration new <name>` | SQL files in `supabase/migrations/` |
| Reset database | `npm run db:reset` | Re-applies every migration and `supabase/seed.sql` |
| RLS tests | `npm run db:test` | pgTAP files in `supabase/tests/`; needs the local stack running |
| Edge Functions | `npx supabase functions serve` | Set up in Fase 0 step 5 |
| Web deploy | `npx expo export -p web && eas deploy` | Set up in Fase 0 step 4 |

CI (`.github/workflows/ci.yml`) runs typecheck, lint and unit tests, and in a second job starts Supabase, resets the database twice and runs the RLS tests, on every push and pull request.

## Working with the owner

- Talk to the owner in Indonesian. Code, comments, commit messages and PR descriptions are in English.
- Plan before large changes. Product decisions listed under "Keputusan terbuka" in `docs/plan.md` are the owner's to make; ask instead of guessing.
- Tick the checkboxes in `docs/fase-0.md` as steps are finished, and note any decision taken along the way.
