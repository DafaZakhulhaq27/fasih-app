# Fasih

AI-assisted IELTS practice that learns from your own mistakes. Daily lessons from a 12-week plan, Writing and Speaking practice checked either by yourself or by AI, a Mistake Bank, and spaced-repetition review — on iOS, Android and the web.

**Status:** planning done, building Fase 0. This is a personal project; sign-up is invite-only.

## Docs

- [`docs/plan.md`](docs/plan.md) — product and architecture plan (Indonesian)
- [`docs/fase-0.md`](docs/fase-0.md) — current work
- [`docs/design/`](docs/design/) — screens and design tokens

## Stack

Expo (React Native, Expo Router, TypeScript) · Supabase (Postgres + RLS, Auth, Storage, Edge Functions) · Gemini API

## Notes

- Practice answers checked with AI are sent to Google's Gemini API. On the free tier, Google may use them to improve its models, so the app asks you to keep personal details out. Self-check mode sends nothing to AI.
- IELTS is a registered trademark of the IELTS Partners (the British Council, IELTS Australia Pty Ltd and Cambridge English). Fasih is not affiliated with or endorsed by them.
