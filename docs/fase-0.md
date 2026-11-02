# Fase 0 — Spike (2–15 November 2026)

Tujuan Fase 0: fondasi jalan di web dan Android, login Google aman, dan dua keputusan teknis diambil dari data — provider speech-to-text dan prompt feedback v1. Fase ini ditutup oleh **Gate 0: STT terpilih dan eval v1 berjalan.**

Kerjakan berurutan. Satu langkah = satu branch atau PR kecil. Centang kotak saat acceptance criteria terpenuhi, dan catat keputusan yang diambil di bawah langkahnya.

## Langkah 0 — Akun dan kredensial (dikerjakan manual oleh pemilik repo)

- [ ] Project Supabase baru (region terdekat, misalnya Singapore). Catat URL dan publishable key.
- [ ] Google Cloud: OAuth consent screen (scope dasar saja: `openid`, `email`, `profile`) dan OAuth client ID untuk **web** dan **Android** (package name + SHA-1 debug). Client ID iOS menyusul saat iOS dibutuhkan.
- [ ] API key Gemini dari Google AI Studio. Catat batas rate limit per model yang tampil di AI Studio.
- [ ] Akun Expo (untuk EAS Build, Update, dan Hosting).

Semua secret disimpan di `.env.local` (tidak di-commit) atau lewat `supabase secrets set`. Lihat `.env.example`.

## Langkah 1 — Scaffold app

- [x] Expo SDK 58 + Expo Router + TypeScript strict di root repo. Gabungkan `.gitignore` bawaan Expo dengan `.gitignore` yang sudah ada.
- [x] ESLint + Prettier, Vitest, path alias `@core/*` ke `supabase/functions/_shared/core/*`.
- [x] Token desain dari `docs/design/README.md` sebagai satu modul `src/theme`, plus font Atkinson Hyperlegible dan Kalam.
- [x] GitHub Actions: typecheck, lint, unit test di setiap push dan PR.
- [x] Isi bagian **Commands** di `CLAUDE.md`.

**Selesai jika:** app tampil di web dan di Android (Expo Go cukup untuk langkah ini), dan CI hijau.

- [x] App tampil di web (dev server dan `npx expo export -p web`).
- [ ] App tampil di Android. Ditunda karena belum ada HP atau emulator; `npx expo export -p android` sudah berhasil membuat bundle.
- [x] CI hijau (PR #1).

Keputusan:

- **Scaffold di luar root.** `create-expo-app` menolak folder yang sudah berisi `CLAUDE.md`, `README.md`, `.claude/` dan `.env.example`. Template `default@sdk-58` dibuat di folder sementara, lalu hanya `package.json`, `app.json`, `tsconfig.json` (ketiganya diadaptasi) dan aset ikon/splash yang disalin. Demo, `README.md`, `LICENSE` dan `AGENTS.md` milik template tidak dipakai.
- **Route di `src/app/`**, mengikuti template SDK 58. Layout di `CLAUDE.md` diperbarui.
- **Package ID `com.dafazakhulhaq.fasih`** untuk Android (`package`) dan iOS (`bundleIdentifier`). Pakai ini saat membuat OAuth client Android di Langkah 0.
- **`web.output: "single"` (SPA).** App ada di balik login dan sesi Supabase hidup di klien, jadi tidak butuh SSR atau halaman statis per route. Docs Expo bertentangan soal nilai default, jadi ditulis eksplisit.
- **ESLint dipin ke `^9`.** `eslint-plugin-react` dan `eslint-plugin-import` di `eslint-config-expo` belum mendukung ESLint 10.
- **Aturan `_shared/core` ditegakkan lint.** `no-restricted-imports` menolak import React, React Native, Expo, Node dan Deno di folder itu.
- **Unit test pertama: kontras warna.** `src/theme/colors.test.ts` memastikan pasangan token untuk teks lolos WCAG AA (4.5:1) dan tanda non-teks lolos 3:1. Ini juga menjaga warna `pencil` alternatif nanti.
- **Font dari `@expo-google-fonts` lewat `useFonts`**, diimpor per bobot supaya hanya 5 file yang ikut bundle. Cara ini jalan di Expo Go dan web. Kalam berukuran ~430 KB per bobot; bisa di-subset nanti jika ukuran bundle web jadi masalah.
- **`npm audit`: 27 temuan moderate** dari dua advisory (`glob`, `minimatch`) di tooling dev (Expo CLI, ESLint), tidak ikut bundle app. "Fix" yang ditawarkan npm berupa downgrade major, jadi dibiarkan sampai Expo atau ESLint merilis versi baru.

## Langkah 2 — Supabase lokal dan migrasi pertama

- [ ] `supabase init` dan `supabase start` (butuh Docker).
- [ ] Migrasi: `profiles` (termasuk `role`, `ai_enabled`, `default_check`), `allowed_emails`, `exam_plans`, trigger yang membuat `profiles` saat user baru dibuat, dan RLS untuk ketiganya.
- [ ] Semua foreign key ke pengguna memakai `on delete cascade`.
- [ ] Seed tanpa data pribadi.

**Selesai jika:** `supabase db reset` bisa diulang tanpa error, dan test RLS membuktikan user A tidak bisa membaca atau mengubah baris user B.

## Langkah 3 — Login Google

- [ ] Web: `signInWithOAuth` dengan PKCE.
- [ ] Android: `@react-native-google-signin/google-signin` lalu `supabase.auth.signInWithIdToken`. Ini butuh development build, tidak jalan di Expo Go.
- [ ] Sesi tersimpan aman di perangkat dan tetap ada setelah app ditutup.
- [ ] Pendaftaran hanya lewat undangan: hook "Before User Created" yang mengecek `allowed_emails`. Cek dulu apakah hook ini tersedia di free plan. Jika tidak, matikan pendaftaran publik dan catat keputusannya di sini.
- [ ] Layar Sign in sesuai `docs/design/screens/01-signin.png`, memakai tombol resmi Google.

**Selesai jika:** login berhasil di web dan Android, email di luar daftar undangan ditolak, dan keluar-masuk app tidak meminta login ulang.

## Langkah 4 — Deploy gratis

- [ ] Web: `npx expo export -p web`, lalu `eas deploy` ke EAS Hosting. Login Google jalan di URL hasil deploy.
- [ ] Android: development build (EAS Build free atau build lokal), instal ke HP lewat ADB.

**Selesai jika:** URL web dan APK di HP sama-sama bisa login dan menampilkan layar Today kosong.

## Langkah 5 — Spike speech-to-text

- [ ] Rekam 10 jawaban Speaking Part 2 (1–2 menit) dengan beberapa kesalahan grammar dan filler yang disengaja: sebagian di Android (`expo-audio`, preset `HIGH_QUALITY`, hasilnya M4A/AAC), sebagian di web (WebM). Rekaman tidak di-commit.
- [ ] Unggah ke bucket privat lewat signed upload URL; baris `attempts` dibuat sebelum memanggil AI.
- [ ] Edge Function `transcribe`: memanggil Gemini lewat REST, model dari env var. Cek nama model di dokumentasi saat itu.
- [ ] Script lokal yang membandingkan Gemini dengan Deepgram Nova-3 (`filler_words=true`) pada 10 rekaman yang sama.
- [ ] Tulis hasil di `docs/spikes/stt.md`: berapa kesalahan disengaja yang tetap muncul di transkrip, filler dan timestamp per kata, latency, dan biaya-ekuivalen.

**Selesai jika:** provider STT dipilih dengan alasan tertulis.

## Langkah 6 — Feedback v1 dan eval pertama

- [ ] Schema Zod untuk feedback di `_shared/core`, sesuai bagian "Schema feedback" di `docs/plan.md`.
- [ ] Prompt `prompts/feedback.v1.md`: rubrik Writing Task 2 ditulis dengan kata-kata sendiri, bukan salinan band descriptors.
- [ ] Edge Function `feedback-writing` dengan structured output, validasi Zod, guard halusinasi (koreksi yang `original`-nya tidak ada di input dibuang), dan log ke `ai_calls`.
- [ ] Runner eval (`npm run eval`) dengan 20 item awal: essay sendiri yang dianotasi manual dan kalimat yang benar. Contoh berband resmi hanya di `eval/private/`.

**Selesai jika:** eval berjalan dengan satu perintah, hasilnya tersimpan, dan precision, false positive rate, serta latency tercatat.

## Langkah 7 — Cek TTS untuk Listening

- [ ] Script lokal: buat satu dialog Listening Part 1 dengan dua pembicara dan coba variasi aksen.
- [ ] Catat di `docs/spikes/tts.md` apa yang bisa dan tidak bisa, serta ukuran file per menit audio.

## Langkah 8 — Silabus minggu 1–2 sebagai data

- [ ] Data `curriculum_units` dan `lessons` untuk minggu 1–2 (topik Pendidikan dan Teknologi), sesuai tabel kurikulum di `docs/plan.md`.
- [ ] Contoh jawaban band 7–8 dan kunci jawaban dicek manual sebelum dipakai.

## Gate 0

- [ ] Provider STT terpilih (Langkah 5).
- [ ] Eval v1 berjalan dan hasilnya tersimpan (Langkah 6).

Setelah Gate 0, lanjut ke Fase 1 sesuai roadmap di `docs/plan.md`.
