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

- [x] `supabase init` dan `supabase start` (butuh Docker).
- [x] Migrasi: `profiles` (termasuk `role`, `ai_enabled`, `default_check`), `allowed_emails`, `exam_plans`, trigger yang membuat `profiles` saat user baru dibuat, dan RLS untuk ketiganya.
- [x] Semua foreign key ke pengguna memakai `on delete cascade`.
- [x] Seed tanpa data pribadi.

**Selesai jika:** `supabase db reset` bisa diulang tanpa error, dan test RLS membuktikan user A tidak bisa membaca atau mengubah baris user B.

- [x] `supabase db reset` dua kali berturut-turut tanpa error (lokal dan di CI).
- [x] 33 test pgTAP lolos. Saat policy sengaja dibocorkan di database lokal, 5 test gagal; saat `anon` diberi grant satu kolom, guard schema gagal. Jadi test-nya memang menangkap kebocoran.
- [x] Sign-up lewat Auth lokal (role `supabase_auth_admin`) membuat baris `profiles` dengan default yang benar.

Keputusan:

- **Supabase CLI sebagai dev dependency** (`supabase` 3.0.0 di `package.json`), dijalankan lewat `npx supabase` atau `npm run db:*`. Versinya ikut terkunci di `package-lock.json`, sama di laptop dan CI.
- **Default privasi di `profiles`: `ai_enabled = false` dan `default_check = 'manual'`.** Jawaban baru dikirim ke Gemini setelah pengguna menyalakan AI di Account. Ini juga membuat teman yang diundang otomatis dalam mode manual (sesuai plan). Kalau kamu lebih suka AI menyala sejak awal untuk akunmu, cukup nyalakan sekali di Account (Langkah 3+), atau ubah default di migrasi berikutnya.
- **Pengguna tidak bisa menaikkan hak sendiri.** Lewat grant per kolom, pengguna hanya boleh mengubah `display_name`, `ai_enabled`, `default_check`, `active_language`, `learning_languages` dan `explain_lang`. `role` dan `daily_budget_usd` hanya bisa diubah lewat SQL atau service role.
- **`daily_budget_usd` boleh `null`**, artinya memakai batas default server (diatur saat guard kuota dibuat).
- **`exam_plans.min_section_band`** ditambahkan karena plan menyebut syarat kampus perlu menyimpan overall dan nilai minimum per bagian.
- **Cek admin lewat `private.is_admin()`**, fungsi security definer di schema `private` yang tidak diekspos Data API, supaya policy tidak rekursif ke `profiles`.
- **`allowed_emails` hanya bisa dibaca dan diubah admin.** Akses untuk hook "Before User Created" (role `supabase_auth_admin`) ditambahkan di Langkah 3 bersama hook-nya.
- **Test RLS memakai pgTAP polos**, tanpa helper `dbdev` yang mengunduh SQL dari internet saat test. Ada juga test schema yang berlaku untuk tabel di migrasi berikutnya: semua tabel `public` wajib RLS, semua FK ke `auth.users` wajib cascade, `anon` tidak punya hak apa pun, dan fungsi security definer wajib mengunci `search_path`.
- **CI punya job `database`**: start Supabase (hanya Postgres dan Auth), `db reset` dua kali, lalu `supabase test db`.

## Langkah 3 — Login Google

- [ ] Web: `signInWithOAuth` dengan PKCE. Kode siap dan diuji lokal sampai redirect ke `/auth/v1/authorize` (provider `google`, PKCE `s256`, kembali ke `/sign-in`). Login penuh menunggu OAuth client Google dari Langkah 0.
- [ ] Android: `@react-native-google-signin/google-signin` lalu `supabase.auth.signInWithIdToken`. Ini butuh development build, tidak jalan di Expo Go.
- [ ] Sesi tersimpan aman di perangkat dan tetap ada setelah app ditutup. Web terbukti (sesi bertahan setelah reload, sign out menghapusnya). Native memakai `LargeSecureStore`, belum diuji di perangkat.
- [x] Pendaftaran hanya lewat undangan: hook "Before User Created" yang mengecek `allowed_emails`. Cek dulu apakah hook ini tersedia di free plan. Jika tidak, matikan pendaftaran publik dan catat keputusannya di sini.
- [x] Layar Sign in sesuai `docs/design/screens/01-signin.png`, memakai tombol resmi Google.

**Selesai jika:** login berhasil di web dan Android, email di luar daftar undangan ditolak, dan keluar-masuk app tidak meminta login ulang.

- [x] Email di luar daftar undangan ditolak (sign-up lewat Auth lokal: email undangan dibuat, email lain ditolak 403 dengan pesan yang jelas).
- [ ] Login berhasil di web dan Android.
- [ ] Keluar-masuk app tidak meminta login ulang (web sudah; Android menunggu development build).

Keputusan:

- **Hook "Before User Created" tersedia di Free plan** (tabel ketersediaan di docs Auth Hooks), jadi pendaftaran publik tidak perlu dimatikan. Fungsinya `private.before_user_created`, diaktifkan lokal lewat `[auth.hook.before_user_created]` di `supabase/config.toml`. **Di project hosted, hook harus diaktifkan juga di Dashboard → Authentication → Hooks** (atau `supabase config push`).
- **Hook juga berlaku untuk user yang dibuat admin** lewat Dashboard ("Add user") atau Admin API. Tambahkan email ke `allowed_emails` dulu, baru buat user-nya.
- **Hook tanpa `security definer`**, sesuai saran docs: `supabase_auth_admin` diberi `execute` pada fungsi, `usage` pada schema `private` dan `public`, `select` pada `allowed_emails`, plus policy RLS khusus role itu. App (`anon`, `authenticated`) tidak bisa memanggil hook.
- **Email tanpa undangan ditolak dengan 403** dan pesan "Fasih is invite-only for now…". Di web, Supabase mengembalikan pesan itu ke `/sign-in?error_description=…` dan layar Sign in menampilkannya.
- **Sesi:** web memakai `localStorage` (bawaan supabase-js). Android/iOS memakai varian `LargeSecureStore` dari tutorial Expo Supabase: kunci AES-256 per item di SecureStore, ciphertext (dengan counter acak per penulisan) di AsyncStorage, karena SecureStore hanya menampung sekitar 2 KB per nilai. Angka acak dari `expo-crypto` (modul SDK yang ada di Expo Go), bukan `react-native-get-random-values` yang dipakai tutorial, karena modul native-nya tidak termasuk SDK 58. Operasi auth di native diserialkan dengan `processLock` supaya dua refresh tidak memakai refresh token yang sama.
- **Route guard** memakai `Stack.Protected` Expo Router: `/` hanya untuk yang login, `/sign-in` hanya untuk yang belum. Splash screen bertahan sampai font dan sesi selesai dimuat.
- **Env divalidasi dengan Zod** (`src/lib/env.ts`); pesan error menyebut variabel yang kosong. Untuk dev lokal, `.env.local` diisi URL dan publishable key Supabase lokal.
- **Tipe database di-generate** ke `src/lib/database.types.ts` (`npm run db:types`); CI gagal jika file ini tidak cocok dengan migrasi.
- **Login Google di Android belum dipasang.** Modul native-nya butuh development build dan OAuth client Android, jadi `google-sign-in.native.ts` untuk sementara hanya menampilkan pesan "pakai versi web dulu".
- **Tombol "Sign out" sementara ada di layar placeholder Today**, untuk menguji alur keluar-masuk. Nanti pindah ke Account.
- **Link "Privacy policy" dari desain belum dipasang**, karena halaman kebijakan privasinya belum ada.
- **Tombol Google memakai aset resmi** dari `signin-assets.zip` Google: varian Light, Square, Android + Web, PNG @4x, ditampilkan 216×48 (rasio aslinya). Teksnya "Sign in with Google" (teks bawaan aset, salah satu teks yang diizinkan Google), bukan "Continue with Google" seperti di desain; warna garis (#747775) dan fontnya juga mengikuti Google, bukan token kita. PNG dipilih karena logo "G" di SVG-nya memakai `foreignObject` dan filter blur yang tidak digambar renderer SVG native. Sumber dan aturannya dicatat di `assets/images/google/README.md`.

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
