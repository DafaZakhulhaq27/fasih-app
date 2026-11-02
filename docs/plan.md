# Fasih — Planning Persiapan IELTS

Diekspor dari planning doc pada 2 November 2026. Versi ini untuk repo publik, jadi konteks pribadi di luar produk sudah dihapus.

## Ringkasan & keputusan utama

Bangun **coach pribadi berbasis AI untuk persiapan IELTS**, dengan target band 7.0 dalam simulasi persiapan 12 minggu. Setiap jawaban Writing dan Speaking dinilai memakai empat kriteria band descriptors resmi, lalu kesalahanmu sendiri menjadi bahan latihan berikutnya.

- **Masalah yang diselesaikan:** level "cukup lancar, kurang natural" kira-kira setara band 6.0–6.5 (B2). Band 7.0 adalah ambang C1, dan lompatannya ada di kosakata yang lebih jarang dan tepat, kalimat kompleks yang akurat, kohesi yang tidak mekanis, serta bicara panjang tanpa banyak jeda — bukan grammar dasar.
- **Konsep inti:** satu loop *Produce → Feedback → Mistake Bank → Review → Measure*, ditambah pelajaran harian dari kurikulum IELTS 12 minggu. Setiap jawaban bisa dicek manual atau dengan AI, jadi app tetap berguna saat AI tidak tersedia.
- **MVP (Fase 1):** diagnostic, pelajaran harian IELTS, Writing Task 2 dengan timer dan estimasi band per kriteria, Speaking Part 1–3 turn-based, Mistake Bank + review harian. Writing Task 1, section practice Listening & Reading bertimer, mock test mode, dan realtime examiner menyusul di Fase 2.
- **Modul belum dipilih:** minggu 1–4 memakai bagian yang sama di Academic dan General Training (Listening, Writing Task 2, Speaking, tipe soal Reading). Modul dipilih di checkpoint minggu 4, sebelum Writing Task 1 dimulai.
- **Stack:** Expo (React Native) + TypeScript untuk iOS, Android, dan web dari satu codebase; Supabase sebagai seluruh backend (Postgres, Auth, Storage, Edge Functions); dan Gemini API untuk LLM, speech-to-text, serta text-to-speech — semuanya di balik interface provider-agnostic.
- **Login & akun:** login Google sejak awal, jadi progres tersinkron di HP dan laptop. Pendaftaran hanya lewat undangan sampai Gemini paid tier, kuota per pengguna, hapus akun, dan kebijakan privasi siap.
- **Multi-bahasa:** MVP hanya bahasa Inggris, tapi semua data latihan diberi kode bahasa dan aturan per bahasa dikumpulkan dalam satu *language pack*, sehingga Arab dan Mandarin bisa ditambahkan nanti tanpa migrasi besar.
- **Biaya:** $0 selama Fase 0–1 dengan free tier Gemini, Supabase Free, dan Expo (EAS) Free. Web dan Android benar-benar gratis; iOS gratis hanya lewat Xcode di Mac dengan instal ulang tiap 7 hari. Gantinya, data latihan dipakai Google untuk mengembangkan model, jadi jawaban tidak boleh berisi data pribadi — termasuk saat menjawab pertanyaan pribadi di Speaking Part 1.
- **Waktu:** rekomendasi 3–4 jam/minggu untuk membangun app,. MVP siap sekitar pertengahan Januari 2027 (spike 2 minggu + build 8 minggu). Simulasi persiapan dimulai Senin 11 Januari 2027 dan ditutup final mock pada Sabtu 3 April 2027.
- **Nilai portofolio:** structured output, eval suite yang mengukur selisih estimasi band AI terhadap band examiner sekaligus membandingkan Gemini dan Claude, pipeline audio lintas platform, sinkronisasi offline, dan kontrol kuota.

## Konteks & tujuan

Pengguna pertamanya adalah pembuatnya sendiri, yang sudah nyaman membaca dan berkomunikasi dalam bahasa Inggris, tapi ingin terdengar lebih natural dan percaya diri. Fokus app sekarang satu: persiapan IELTS dengan target band 7.0, dijalankan sebagai simulasi 12 minggu walau belum ada tanggal test resmi. English untuk kerja tetap ada sebagai latihan bebas di tab Practice, dengan skenario karangan dan tanpa estimasi band. App ini sekaligus proyek portofolio.

| Bagian | Format test | Cara dinilai | Peran app |
| --- | --- | --- | --- |
| Listening | 30 menit, 40 soal, 4 part (2 percakapan, 2 monolog); audio diputar sekali | Jawaban benar/salah; band 7 kira-kira 30/40 | Drill tipe soal di pelajaran harian; section practice bertimer di Fase 2; skor utama dari tes latihan resmi |
| Reading | 60 menit, 40 soal; Academic 3 passage panjang, General Training 5–6 teks | Jawaban benar/salah; band 7 kira-kira 30/40 (Academic) atau 35/40 (General Training) | Sama dengan Listening |
| Writing | 60 menit; Task 1 min. 150 kata (±20 menit), Task 2 min. 250 kata (±40 menit); Task 2 berbobot lebih besar | Empat kriteria: Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy | Inti MVP: editor bertimer + estimasi band per kriteria + koreksi |
| Speaking | 11–14 menit dengan examiner; Part 1 (4–5 menit), Part 2 (1 menit persiapan, bicara sampai 2 menit), Part 3 (4–5 menit) | Empat kriteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation | Inti MVP: Part 1–3 turn-based dengan suara examiner dari TTS; realtime di Fase 2 |

**Prioritas:** Writing dan Speaking jadi inti MVP karena penilaiannya subjektif berbasis rubrik — di situ feedback AI paling berguna dan paling sulit didapat sendiri. Listening dan Reading punya jawaban objektif, jadi tes latihan resmi tetap menjadi ukuran utamanya; app melatih strategi tipe soal dan mencatat skornya. Test di Indonesia sekarang berbasis komputer (British Council berhenti menyediakan IELTS di atas kertas sejak 21 Juni 2026), jadi latihan mengetik essay dengan timer di layar sudah sesuai kondisi test, dan paling realistis dikerjakan di versi web di laptop.

**Batasan:**

- **Waktu** — dibangun 3–4 jam per minggu di sela kesibukan lain, jadi setiap iterasi app harus kecil.
- **Kamu pengguna pertama** — login Google dan RLS per pengguna sejak awal, tapi pendaftaran hanya lewat undangan dan tanpa billing. Orang lain baru diundang setelah syarat di bagian Backend, login & deploy terpenuhi.
- **Biaya** — target $0 di Fase 0–1 dengan free tier; API berbayar baru dipertimbangkan di Gate 1 jika hasil eval membuktikan perlu.
- **Privasi** — free tier Gemini memakai input dan output untuk pengembangan model, dan reviewer manusia bisa membacanya. Topik IELTS umumnya bersifat umum, tapi Speaking Part 1 menanyakan hal pribadi (asal, pekerjaan, keluarga); jawab dengan detail yang tidak mengidentifikasi — tanpa nama, nama kantor, atau alamat.
- **Hak cipta** — buku Cambridge IELTS dan tes latihan resmi dipakai di luar app; app hanya menyimpan tautan dan skormu, karena repo akan publik sebagai portofolio.

## Konsep inti: learning loop berbasis kesalahan

Setiap sesi latihan menghasilkan data kesalahan, dan data itulah yang menentukan latihan berikutnya. Loop ini yang membuat empat skill tidak menjadi empat app terpisah.

> **Diagram learning loop:** Produce → Feedback → Capture (Mistake Bank) → Review (FSRS) → Measure, lalu kembali ke Produce. Measure memilih kriteria terlemah dan kesalahan yang paling sering berulang sebagai fokus berikutnya.

Langkah Measure menutup loop: kriteria dengan band terendah dan kategori kesalahan yang paling sering berulang menentukan latihan berikutnya.

1. **Produce** — kamu mengerjakan tugas IELTS: essay Writing Task 2, jawaban Speaking Part 1–3, atau soal Listening dan Reading di pelajaran harian.
2. **Feedback** — AI memberi estimasi band per kriteria beserta kutipan bukti dari jawabanmu (di cek manual, kamu menilai sendiri dengan checklist dan contoh jawaban), memisahkan *kesalahan* (salah secara grammar) dari *kurang natural* (benar tapi kaku), dan memberi versi band 7–8 yang tetap memakai idemu. Untuk speaking ditambah kecepatan bicara, filler words, dan jeda panjang.
3. **Capture** — setiap koreksi, dari AI maupun yang kamu tandai sendiri, tersimpan di Mistake Bank dengan kategori (artikel, preposisi, tense, collocation, kosakata, kohesi, pengucapan) yang dipetakan ke kriteria IELTS.
4. **Review** — koreksi dan kosakata topik berubah menjadi kartu latihan (cloze, rewrite, listen-and-repeat) yang dijadwalkan dengan spaced repetition.
5. **Measure** — tren estimasi band per kriteria, kesalahan per 100 kata, dan skor tes latihan resmi menunjukkan kriteria terlemah, yang lalu menjadi fokus latihan berikutnya.

**Peran tiap skill dalam loop:**

- **Writing & speaking** — sumber data utama (Produce), sekaligus bagian yang dinilai AI dengan rubrik.
- **Vocab & grammar** — hasil dari Capture dan Review, ditambah kosakata topik IELTS dari pelajaran harian; bukan modul hafalan terpisah.
- **Listening & reading** — dilatih lewat tipe soal resmi di pelajaran harian; jawaban salah dicatat per tipe soal, dan salah dengar saat dikte masuk Mistake Bank.

Di samping loop ini ada jalur kedua: **pelajaran harian dari kurikulum IELTS 12 minggu** yang memberi materi baru setiap hari. Kesalahan saat latihan di pelajaran masuk ke loop yang sama, jadi kurikulum dan koreksi personal saling mengisi.

## Fitur per modul & prioritas

MVP berisi diagnostic, pelajaran harian, dan lima fitur yang membentuk loop lengkap, dengan fokus ke Writing dan Speaking. Fitur ujian yang lebih lengkap masuk Fase 2, setelah MVP dipakai rutin.

| Fitur | Fase | Bagian IELTS | Cara kerja inti |
| --- | --- | --- | --- |
| Diagnostic | 1 (MVP) | Semua | Writing Task 2 dan Speaking Part 1–3 dikerjakan di app; Listening dan Reading memakai tes latihan resmi gratis, lalu skor mentahnya diinput. Hasilnya baseline band per bagian dan per kriteria |
| Pelajaran harian IELTS | 1 (MVP) | Semua | 10–15 menit per hari: input, notice, practice, produce; satu unit per minggu dengan checkpoint Sabtu |
| Writing Task 2 Coach | 1 (MVP) | Writing | Prompt Task 2 → menulis dengan timer 40 menit, penghitung kata (min. 250), dan spell-check nonaktif seperti test komputer → cek manual atau cek AI. Cek AI: estimasi band per kriteria + koreksi berkategori + versi band 7–8; opsi perbaiki sendiri dulu sebelum lihat versi AI |
| Speaking Practice Part 1–3 (turn-based) | 1 (MVP) | Speaking | Pertanyaan dibacakan TTS; Part 2 menampilkan kartu topik dengan 1 menit persiapan dan rekaman maks 2 menit → cek manual atau cek AI. Cek AI: transkrip → estimasi band per kriteria, WPM, filler, jeda → dengarkan versi yang lebih baik |
| Cek manual (tanpa AI) | 1 (MVP) | Writing, Speaking | Statistik dari kode, checklist per kriteria, contoh jawaban band 7–8, tandai kesalahan sendiri, dan band sendiri; tidak ada data yang dikirim ke AI. Selalu tersedia, dan otomatis ditawarkan saat AI tidak tersedia |
| Mistake Bank | 1 (MVP) | Writing, Speaking | Semua koreksi tersimpan — dari AI, dari cek manual, dan dari jawaban salah di pelajaran — bisa difilter per kategori dan kriteria, ditandai dikuasai atau diabaikan |
| Review harian (SRS) | 1 (MVP) | Semua | Sesi ±10 menit; kartu dari Mistake Bank dan kosakata pelajaran dijadwalkan FSRS; soal isian, pilihan ganda, susun kalimat, dengar lalu ketik |
| Progress band | 1 (MVP) | Semua | Estimasi band per kriteria dari waktu ke waktu (AI dan penilaian sendiri dipisah), skor tes latihan resmi, hitung mundur ke final mock, kesalahan per 100 kata, streak |
| Pemilih bahasa | 1 (MVP) | — | Hanya bahasa Inggris yang aktif; Arab dan Mandarin tampil sebagai "belum tersedia" |
| Latihan bebas English kerja | 1 (MVP), dipotong pertama jika jadwal mundur | — | Skenario karangan (email, pesan di chat tim, presentasi singkat) di tab Practice, memakai engine Writing dan Speaking yang sama tanpa timer dan estimasi band; hanya koreksi dan catatan register. Tidak memakai konten kantor sungguhan |
| Writing Task 1 | 2 | Writing | Mulai minggu 5 sesuai modul: Academic = mendeskripsikan grafik, tabel, atau diagram (dirender dari data, bukan gambar AI); General Training = menulis surat. Min. 150 kata, timer 20 menit |
| Section practice Listening & Reading | 2 | Listening, Reading | Satu part Listening atau satu passage Reading dengan timer; audio dibuat TTS sekali lalu di-cache; dinilai otomatis per tipe soal |
| Mock test mode | 2 | Semua | Urutan dan waktu seperti test komputer: Listening 30 → Reading 60 → Writing 60 menit, Speaking terpisah. Listening dan Reading memakai tes latihan resmi; Writing dan Speaking di app |
| Realtime examiner | 2 | Speaking | Speaking Part 1–3 voice-to-voice dengan Gemini Live, termasuk follow-up dan interupsi; ringkasan band setelah sesi |
| Pronunciation scoring | 2 | Speaking | Skor per kata dan fonem untuk kalimat yang di-shadowing; dibaca sebagai tren |
| Mini lesson dari kesalahan | 3 | Writing, Speaking | Saat satu kategori sering muncul, pelajaran tambahan 3 menit disisipkan ke unit berjalan |
| Dictation & shadowing | 3 | Listening, Speaking | Klip audio pendek → tulis ulang → diff dengan transkrip → salah dengar masuk Mistake Bank |
| Laporan mingguan | 3 | — | Ringkasan otomatis tiap Minggu: perubahan band, kesalahan berulang, fokus minggu depan |
| Bahasa kedua (Arab atau Mandarin) | Setelah Fase 3 | — | Language pack baru dengan taksonomi kesalahan, kurikulum, voice, dan golden set sendiri |

**Bank soal awal MVP** (disimpan sebagai data, mudah ditambah): prompt Writing Task 2 untuk lima tipe essay yang umum dipakai materi persiapan — opinion (agree/disagree), discussion (dua pandangan), advantages/disadvantages, problem/solution, dan two-part question — serta topik Speaking Part 1–3 umum seperti tempat tinggal, studi, teknologi, lingkungan, dan pendidikan. Semuanya ditulis sendiri atau dibuat AI dari silabus, bukan disalin dari buku.

**Keputusan produk:**

- **Dua cara cek: manual dan AI** — kamu memilih per jawaban, dengan default di pengaturan. Cek manual selalu tersedia; cek AI menambah koreksi dan estimasi band. Lihat bagian di bawah.
- **Turn-based sebelum realtime** — lebih murah, lebih mudah di-debug, dan feedback per jawaban lebih detail. Realtime examiner dibangun di Fase 2 untuk melatih tekanan percakapan langsung.
- **Band selalu berlabel estimasi** — setiap angka disertai alasan dari descriptor dan kutipan dari jawaban, bukan angka tunggal tanpa penjelasan. Band dari penilaian sendiri berlabel "self-check".
- **Feedback dibatasi** — tampilkan 3–5 koreksi paling penting per jawaban, sisanya dilipat. Koreksi berlebihan membuat kewalahan dan berhenti latihan.
- **Coba dulu, baru lihat** — memperbaiki kalimat sendiri sebelum melihat versi AI melatih active recall, bukan sekadar membaca.
- **Kondisi seperti test komputer** — timer selalu terlihat, ada penghitung kata, dan tanpa spell-check atau autocorrect saat Writing.
- **Penjelasan bilingual** — default bahasa Inggris, dengan toggle penjelasan bahasa Indonesia untuk konsep yang membingungkan.

### Dua mode cek: manual dan AI

Sebagian besar AI di plan ini dipakai saat membuat materi, bukan saat app dipakai: pelajaran, soal, audio Listening, dan contoh jawaban dibuat sekali per unit, dicek, lalu disimpan. Karena itu pelajaran, review, Progress, dan mock tetap jalan penuh tanpa AI. Yang butuh pilihan hanya pengecekan jawaban bebas — essay dan rekaman Speaking.

|  | Cek manual | Cek AI |
| --- | --- | --- |
| Yang dikirim ke AI | Tidak ada | Teks essay atau audio rekaman ke Gemini |
| Writing | Statistik dari kode (jumlah kata, panjang kalimat, kata penghubung dan kata yang berulang), checklist per kriteria, contoh jawaban band 7–8, tandai kesalahan sendiri, band sendiri per kriteria | Estimasi band per kriteria dengan kutipan bukti, maks. 5 koreksi berkategori, versi band 7–8 dari idemu |
| Speaking | Dengar ulang rekaman, durasi dan jeda panjang dari level suara, checklist per kriteria, audio contoh jawaban untuk shadowing, catat kesalahan sendiri | Transkrip, estimasi band per kriteria, WPM, filler, jeda, dan versi yang lebih baik |
| Masuk Mistake Bank | Kesalahan yang kamu tandai (`source = self`) | Koreksi dari AI (`source = ai`) |
| Band di Progress | Berlabel "self-check", dipisah dari estimasi AI | Berlabel "estimasi AI" |

**Kapan mode manual dipakai:**

- **Pilihanmu sendiri** — tombol "Self-check" dan "AI feedback" di layar hasil; default diatur di Account.
- **Otomatis saat AI tidak tersedia** — kuota habis, offline, atau Gemini gangguan. Jawaban disimpan dengan status `pending`, dan kamu bisa meminta cek AI nanti.
- **AI dimatikan per pengguna** — `profiles.ai_enabled = false`. Ini membuat teman bisa diundang lebih awal dalam mode manual saja, karena tidak ada data mereka yang dikirim ke Gemini.
- **Bandingkan keduanya** — setelah self-check, tombol "Ask AI too" menjalankan cek AI pada jawaban yang sama. Selisih band sendiri dan band AI melatih kemampuan menilai tulisan sendiri, yang dibutuhkan saat test.

Checklist ditulis dengan kata-kata sendiri berdasarkan band descriptors publik, bukan salinan teksnya. Grammar checker berbasis aturan seperti LanguageTool bisa ditambahkan ke cek manual di Fase 3; versi publiknya mengirim teks ke server pihak ketiga, jadi diperlakukan sama seperti AI dalam hal privasi.

## Kurikulum IELTS 12 minggu

Setiap hari ada satu pelajaran 10–15 menit dari kurikulum persiapan IELTS 12 minggu dengan target band 7.0, di samping latihan dari kesalahanmu. Simulasinya dimulai Senin 11 Januari 2027 dan ditutup final mock pada Sabtu 3 April 2027.

**Acuan:**

- **IELTS band descriptors publik** untuk Writing (versi diperbarui Mei 2023) dan Speaking — empat kriteria per bagian, dipakai sebagai rubrik feedback dan checkpoint ([Writing](https://ielts.org/cdn/ielts-downloadable-assets/ielts-guidance-and-support/ielts-guides/ielts-writing-band-descriptors.pdf), [Speaking](https://ielts.org/cdn/ielts-downloadable-assets/ielts-guidance-and-support/ielts-guides/ielts-speaking-band-descriptors.pdf)).
- **Format dan tipe soal resmi** — durasi, jumlah soal, dan tipe soal Listening serta Reading mengikuti panduan IELTS ([format](https://takeielts.britishcouncil.org/take-ielts/test-format), [tipe soal Listening](https://ielts.idp.com/prepare/article-question-types-listening), [tipe soal Reading](https://ielts.com.au/australia/prepare/article-ielts-reading-question-types)).
- **Pemetaan IELTS–CEFR** — band 5.5–6.5 setara B2 dan band 7–8 setara C1 ([IELTS](https://ielts.org/news-and-insights/everything-you-need-to-know-about-ielts-and-the-cefr)); karena itu kosakata pelajaran dicek ke level C1 di English Vocabulary Profile ([English Profile](https://en.wikipedia.org/wiki/English_Profile)).
- **Tes latihan resmi gratis** — British Council menyediakan tes latihan Academic dan General Training per bagian, termasuk tes pengenalan format komputer ([British Council](https://takeielts.britishcouncil.org/prepare-test/free-practice-tests)); dipakai untuk diagnostic dan mock.

Band descriptors dan tes latihan resmi dipakai sebagai acuan dan alat ukur, tidak disalin ke repo publik. English Vocabulary Profile hanya gratis untuk penggunaan non-komersial, jadi cek lisensinya sebelum app dirilis publik atau komersial.

**Struktur:**

- **Diagnostic** di awal (±2,5 jam, bisa dicicil 2–3 hari): Writing Task 2 dan Speaking Part 1–3 di app, Listening dan Reading dari tes latihan resmi. Hasilnya baseline band per bagian dan per kriteria. Semua tetap mulai dari minggu 1, tapi tugas Produce dan review diarahkan ke kriteria terlemah.
- **12 minggu = 12 unit.** Setiap unit punya satu topik, 5 pelajaran Senin–Jumat, dan checkpoint hari Sabtu; Minggu untuk review saja.
- **Pola mingguan:** Senin Listening, Selasa Reading, Rabu Writing, Kamis Speaking, Jumat kosakata topik dan pengucapan.
- **Checkpoint Sabtu:** satu tugas Writing atau Speaking bertimer yang dinilai per kriteria, ditambah drill tipe soal minggu itu. Jika akurasi drill di bawah 70% atau ada kriteria yang turun dari minggu sebelumnya, materinya masuk lagi sebagai review dan drill minggu berikutnya — jadwal 12 minggu tidak mundur.
- **Tiga mock:** diagnostic (minggu 0), mid mock (Sabtu minggu 6), dan final mock (Sabtu minggu 12).
- **Modul dipilih di checkpoint minggu 4.** Writing Task 1 dan gaya teks Reading mengikuti modul mulai minggu 5. Selama modul belum dipilih, slot Task 1 diisi latihan Task 2.

**Empat langkah tiap pelajaran** (pola task-based dengan fokus pada bentuk bahasa):

1. **Input** — contoh jawaban band 7–8 (paragraf essay atau jawaban speaking), audio Listening, atau passage Reading pendek.
2. **Notice** — pola yang membuat jawaban itu bernilai tinggi (collocation, struktur kompleks, cohesive device) atau strategi tipe soal, dengan toggle penjelasan bahasa Indonesia.
3. **Practice** — 5 soal: tipe soal IELTS untuk Listening dan Reading (True/False/Not Given, matching headings, form completion, dan lainnya), isian, susun kalimat, atau pilih yang paling natural.
4. **Produce** — tulis satu paragraf atau jawab satu pertanyaan Speaking dengan pola target; dinilai feedback engine yang sama, dan kesalahannya masuk Mistake Bank.

**Jalur IELTS 12 minggu (target band 7.0):**

| Minggu | Topik | Writing | Speaking | Listening & Reading |
| --- | --- | --- | --- | --- |
| 1 | Pendidikan | Task 2 opinion: posisi jelas dari pendahuluan sampai kesimpulan | Part 1: jawab, beri alasan, beri contoh | Form completion; True/False/Not Given |
| 2 | Teknologi | Task 2 discussion: dua pandangan dan pendapatmu | Part 2: kerangka 1 menit untuk bicara 2 menit | Multiple choice; matching headings |
| 3 | Lingkungan | Task 2 problem/solution: satu ide utama per paragraf | Part 3: pendapat abstrak dan hedging | Plan/map labelling; matching information |
| 4 | Kerja & ekonomi | Task 2 advantages/disadvantages; checkpoint memilih modul | Part 1–3 berurutan | Sentence completion; summary completion |
| 5 | Kesehatan | Task 1 pertama: overview dan fitur utama (Academic) atau tujuan dan nada surat (General Training) | Part 2: cerita pengalaman dengan narrative tenses | Listening Part 3 (diskusi); Yes/No/Not Given |
| 6 | Mid mock | Task 1 + Task 2 dalam 60 menit | Speaking penuh | Tes latihan resmi Listening & Reading |
| 7 | Kota & transportasi | Task 2 two-part question; cohesive device yang tidak mekanis | Part 3: membandingkan dulu, sekarang, dan masa depan | Note/table/flow-chart completion; matching sentence endings |
| 8 | Budaya & media | Task 1 kedua: membandingkan data (Academic) atau surat formal (General Training) | Part 2: menggambarkan orang atau tempat dengan kosakata yang lebih jarang | Listening Part 4 (kuliah); classification |
| 9 | Sains & riset | Task 2: kalimat kompleks yang akurat (relative clause, participle clause) | Part 3: spekulasi (might, could, it's likely that) | Short-answer questions; matching statements to people or things |
| 10 | Globalisasi | Task 2: parafrase soal dan variasi kosakata | Part 1–3: self-correction yang natural | Satu part Listening dan satu passage Reading bertimer |
| 11 | Masyarakat & pemerintah | Task 1 + Task 2 dalam 60 menit | Speaking penuh, fokus stress dan intonasi | Section bertimer untuk tipe soal terlemah |
| 12 | Final mock | Final mock, Sabtu 3 April 2027 | Final mock | Tes latihan resmi Listening & Reading |

Setiap Jumat khusus kosakata topik minggu itu (dicek ke level C1 English Vocabulary Profile) dan pengucapan: word stress, sentence stress, linking, dan intonasi. Setelah final mock, siklus 12 minggu berikutnya bisa diulang dengan topik baru dan fokus ke kriteria yang belum mencapai 7.0. Bahasa lain nanti mendapat kurikulumnya sendiri lewat language pack.

**Cara konten dibuat:**

- **Silabus ditulis sebagai data** (minggu, topik, tipe soal, pola target, kosakata), bukan dikarang bebas oleh AI.
- **Isi pelajaran dibuat AI sekali per unit** dari silabus itu, dicek manual, lalu disimpan — lebih murah, konsisten, dan bisa dievaluasi.
- **Soal Reading dan Listening buatan AI hanya untuk drill.** Tipe seperti True/False/Not Given mudah ambigu, jadi setiap soal wajib menyertakan kutipan bukti dari teks dan dicek manual. Ukuran band Listening dan Reading tetap dari tes latihan resmi.
- **Audio Listening dibuat TTS sekali per unit** lalu di-cache. Dukungan dua pembicara dan variasi aksen dicek di Fase 0; jika terbatas, paparan aksen yang beragam diambil dari tes latihan resmi.
- **Contoh jawaban band 7–8** dibuat AI, lalu dicek manual terhadap band descriptors sebelum dipakai sebagai Input.

## Arsitektur sistem & tech stack

Rekomendasinya satu app Expo untuk iOS, Android, dan web, dengan Supabase sebagai seluruh backend: panggilan AI lewat Edge Functions agar API key aman dan biaya tercatat per request, sedangkan progres ditulis langsung dari app ke Postgres lewat RLS. MVP tidak butuh microservice, message queue, atau infrastruktur realtime.

> **Diagram arsitektur:** App Expo (iOS, Android, web; `expo-audio`, antrean offline, FSRS) → HTTPS + JWT → Supabase Edge Functions (orkestrasi STT → LLM → DB, hitung band/WPM/jeda, guard kuota, log `ai_calls`) → Gemini API (free tier: 3.8 Flash / Flash-Lite, Transcribe, Flash TTS; Fase 2: Live, Azure Pronunciation). App juga menulis progres dan mengunggah audio langsung ke Supabase (Postgres + RLS, Auth login Google, Storage audio privat).

API key dan pencatatan kuota hanya ada di server, sementara audio diunggah langsung dari app ke Storage. Untuk realtime di Fase 2, Gemini Live API menyediakan ephemeral token ([docs](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens)) sehingga app bisa tersambung langsung tanpa memegang API key. Di iOS dan Android, sesi realtime kemungkinan butuh modul streaming audio tambahan; keduanya diverifikasi di awal Fase 2.

| Lapisan | Pilihan | Alasan | Alternatif |
| --- | --- | --- | --- |
| Frontend | Expo SDK 58 + Expo Router + TypeScript strict | Satu codebase untuk iOS, Android, dan web; kamu sudah biasa React Native | Next.js PWA jika cukup web saja |
| Backend AI | Supabase Edge Functions (Deno) | API key tetap di server; JWT pengguna diteruskan sehingga query di function tetap lewat RLS; 500.000 panggilan/bulan gratis | Node di Vercel jika butuh paket npm yang tidak jalan di Deno |
| Database & auth | Supabase Postgres, Auth (login Google), Row Level Security | RLS menjaga data per pengguna; progres ditulis langsung dari app | — |
| Audio | `expo-audio` untuk rekam + Supabase Storage, bucket privat + signed URL | AAC di iOS/Android, WebM di web; keduanya diterima Gemini tanpa konversi | Cloudflare R2 |
| Data di app | TanStack Query + antrean tulis offline di `expo-sqlite` | Cache baca, dan jawaban tetap tersimpan saat sinyal hilang | PowerSync jika butuh sinkronisasi penuh |
| LLM feedback | Gemini 3.8 Flash + structured outputs | Gratis di free tier; JSON sesuai schema | Claude Sonnet 5.5 (berbayar), dibandingkan lewat eval |
| LLM ringan | Gemini 3.5 Flash-Lite | Membuat kartu, klasifikasi kategori, ringkasan | Claude Haiku 5.5 |
| Speech-to-text | Gemini 3.5 Transcribe | Gratis; timestamp per kata untuk deteksi jeda | Deepgram Nova-3 (kredit awal $200) |
| Text-to-speech | Gemini 3.8 Flash TTS | Gratis; suara examiner, audio Listening, dan versi perbaikan untuk shadowing | `expo-speech` (TTS bawaan perangkat) |
| Spaced repetition | ts-fsrs (FSRS v6) | Algoritma teruji, tidak perlu ditulis sendiri | SM-2 manual |
| Realtime (Fase 2) | Gemini 3.8 Live lewat ephemeral token | Voice-to-voice, juga tersedia di free tier; app tersambung langsung | OpenAI Realtime API |
| Pronunciation (Fase 2) | Azure Speech Pronunciation Assessment | Skor akurasi, fluency, dan prosody per kata; kuota gratisnya dicek saat Fase 2 | — |
| Distribusi | EAS Hosting (web), APK lewat ADB (Android), Xcode (iOS, butuh Mac) | Gratis untuk pemakaian pribadi | Play Store $25 sekali, App Store $99/tahun |
| Observability | Tabel `ai_calls` + Sentry | Latency, token, kuota, dan biaya-ekuivalen per panggilan | Langfuse |

**Jebakan STT untuk app belajar bahasa.** Transkrip yang "terlalu rapi" justru bug: filler words dan kesalahan grammar bisa hilang sebelum sampai ke LLM. Deepgram, misalnya, secara default membuang "uh" dan "um" kecuali `filler_words=true` diaktifkan ([Deepgram](https://developers.deepgram.com/docs/filler-words)). Karena itu provider STT dipilih lewat uji, bukan reputasi.

**Kriteria spike STT (Fase 0)** — Gemini 3.5 Transcribe (gratis) diuji melawan Deepgram Nova-3 (kredit awal $200):

- **Error preservation** — dari 10 rekaman berisi kesalahan yang disengaja, berapa yang tetap muncul di transkrip.
- **Filler & jeda** — filler terdeteksi dan tersedia timestamp per kata untuk mendeteksi jeda panjang.
- **Latency** — waktu transkripsi untuk jawaban 60–120 detik.
- **Biaya** — per menit audio.

**Alur satu jawaban speaking:**

1. App merekam dengan `expo-audio`: AAC (.m4a) di iOS dan Android dengan preset `HIGH_QUALITY` (preset `LOW_QUALITY` di Android menghasilkan AMR .3gp yang buruk untuk STT), WebM di web.
2. Audio diunggah langsung ke Storage via signed upload URL, dan baris `attempts` dibuat sebelum panggilan AI apa pun — jawaban tidak hilang walau AI gagal atau kena rate limit.
3. Edge Function memanggil Gemini 3.5 Transcribe → transkrip verbatim + timestamp kata. Format M4A dan WebM diterima langsung, jadi tidak ada konversi audio.
4. Metrik deterministik dihitung di kode (WPM, jumlah filler, jeda > 2 detik) — LLM tidak diminta menghitung.
5. Gemini 3.8 Flash dengan structured output menghasilkan koreksi dan versi yang lebih baik.
6. Feedback dan mistakes disimpan dalam satu transaksi; kartu SRS dibuat Gemini 3.5 Flash-Lite lewat `EdgeRuntime.waitUntil` setelah respons dikirim.
7. Versi perbaikan diubah jadi audio lewat Gemini 3.8 Flash TTS saat diminta, lalu di-cache di Storage.

**Provider-agnostic dan tahan rate limit.** Free tier bisa berubah kapan saja, jadi pergantian provider harus semurah mengganti config.

- **Interface per kemampuan** — `Transcriber`, `FeedbackEngine`, `Speaker`, `RealtimeSession`; implementasi Gemini dulu, Claude atau Deepgram hanya jika eval menunjukkan perlu.
- **Model ID di environment variable**, bukan di kode.
- **Rate limit free tier tidak dipublikasikan** — batas per model hanya terlihat di AI Studio dan berlaku per project, jadi cek di sana sejak Fase 0.
- **Error 429** ditangani dengan retry + exponential backoff dan jitter; jika masih gagal, attempt ditandai `pending` dan diproses ulang nanti, bukan dibuang.
- **Pembatas lokal** — jumlah request per menit dan per hari dihitung dari `ai_calls` sebelum memanggil API, supaya app berhenti dengan pesan jelas sebelum ditolak provider.

**Siap multi-bahasa sejak awal.** Bahasa kedua baru dibangun setelah Fase 3, tapi beberapa fondasi murah dikerjakan sekarang karena mahal jika ditambahkan belakangan.

| Aspek | Dikerjakan sekarang (MVP) | Ditunda sampai bahasa kedua |
| --- | --- | --- |
| Data | Kolom `target_language` (kode BCP 47: `en`, `ar`, `zh-Hans`) di semua tabel latihan | Data dan skenario untuk bahasa baru |
| Aturan per bahasa | Interface `LanguagePack` dengan satu implementasi: `en` | Pack `ar` dan `zh-Hans` |
| Kategori kesalahan | Tabel `mistake_categories` per bahasa, bukan enum global | Taksonomi baru: nada dan kata bantu bilangan (Mandarin), gender dan bentuk kata kerja (Arab) |
| Hitungan metrik | Kata dihitung lewat fungsi `countUnits()` di language pack, bukan langsung dipisah per spasi di layar | Mandarin memakai karakter per menit dan error per 100 karakter; dukungan `Intl.Segmenter` di Hermes dicek saat itu |
| Tata letak | Style memakai `start`/`end`, bukan `left`/`right`, dan arah teks ditentukan per elemen | Uji penuh tampilan kanan-ke-kiri untuk Arab (`I18nManager` di native, `dir` di web), termasuk tanda koreksi |
| Font | Font dipilih per aksara lewat language pack | Font Arab dan Han, termasuk gaya tulisan tangan untuk koreksi |
| AI | Prompt, rubrik, dan golden set disimpan per bahasa | Eval terpisah per bahasa, karena kualitas model bisa berbeda antar bahasa |

Isi `LanguagePack`: kode bahasa, arah teks, satuan hitung (kata atau karakter), daftar filler words ("um" untuk Inggris, "嗯" dan "那个" untuk Mandarin, "يعني" untuk Arab), taksonomi kesalahan, skenario, voice TTS, dan template prompt. Menambah bahasa berarti menambah satu pack beserta eval-nya, bukan mengubah alur aplikasi.

## Backend, login & deploy

Supabase menjadi seluruh backend. Setiap jenis kerja ditempatkan di lapisan yang paling murah dan paling aman untuknya.

| Kerja | Tempat | Alasan |
| --- | --- | --- |
| Feedback Writing dan Speaking, transkripsi, ephemeral token Gemini Live, hapus akun | Edge Functions | Butuh API key atau service role; hasil AI ditulis server supaya tidak bisa diubah dari app |
| Progres pelajaran, rating review, skor tes latihan resmi, pengaturan | Langsung dari app ke Postgres lewat RLS | Data milik pengguna sendiri, tanpa AI, harus cepat dan bisa offline |
| Materi unit, audio TTS Listening, eval suite | Script Node di laptop | Kerja panjang yang dicek manual dulu; terlalu berat untuk batas Edge Functions |

**Plus dan minus Edge Functions:**

- **Plus** — satu platform dengan Auth, DB, dan Storage; JWT pengguna diteruskan sehingga query di function tetap lewat RLS; secret disimpan dengan `supabase secrets set`; waktu menunggu Gemini tidak dihitung sebagai CPU; `EdgeRuntime.waitUntil` untuk kerja setelah respons dikirim.
- **Minus** — runtime Deno (sebagian paket npm bisa tidak jalan); batas 2 detik CPU, 256 MB memori, dan 150 detik per request di free plan; cold start; log hanya disimpan 1 hari; dev lokal butuh Docker; project di-pause setelah seminggu sepi.
- **Mitigasi** — Gemini dipanggil lewat REST dengan `fetch`; logika inti ditulis sebagai TypeScript murni yang dipakai bersama app dan function (`"zod"` dipetakan ke `npm:zod` di `deno.json`); handler dibuat tipis supaya bisa dipindah ke Node; sesi realtime tidak diproksikan lewat function; aksi kecil seperti rating review ditulis langsung ke DB tanpa function.

**Login & akun:**

- **Login Google sejak awal.** iOS dan Android memakai `@react-native-google-signin/google-signin` lalu `signInWithIdToken` (butuh development build, tidak jalan di Expo Go); web memakai `signInWithOAuth` dengan PKCE. Tiga OAuth client ID di Google Cloud: web, Android (SHA-1 untuk debug dan release), dan iOS.
- **Hanya lewat undangan dulu.** Hook "Before User Created" menolak email di luar tabel `allowed_emails`. Ketersediaan hook di free plan dicek di Fase 0; jika tidak tersedia, pendaftaran publik dimatikan dan pengguna diundang manual.
- **Syarat sebelum dibuka untuk orang lain:** Gemini paid tier (data mereka tidak boleh dipakai melatih model), kuota AI per pengguna, hapus akun di dalam app plus link web (diwajibkan Apple dan Google Play), dan kebijakan privasi singkat.
- **Hapus akun** lewat Edge Function `delete-account`: menghapus user di Auth, semua baris (foreign key `on delete cascade`), dan file audio di Storage.
- **Sign in with Apple** wajib ditambahkan jika app dirilis di App Store dengan login Google.
- **Peran admin** di `profiles.role`: hanya admin yang bisa menulis materi dan membaca laporan soal.

**Menyimpan progres:**

- **RLS per tabel, termasuk aturan tulis.** App hanya boleh menulis `band_scores` dengan `is_estimate = false` (skor tes resmi); estimasi band dari AI hanya ditulis Edge Function. Hasil cek manual (band sendiri dan kesalahan yang kamu tandai) ditulis app dengan source self, jadi selalu terpisah dari hasil AI.
- **Atomik.** Satu rating review = baris `review_logs` + update `review_cards` dalam satu fungsi Postgres `record_review`; FSRS tetap dihitung di app dengan ts-fsrs.
- **Aman di dua perangkat.** Kolom `version` di `review_cards`; update hanya jalan jika versinya cocok, jika tidak app memuat ulang kartu itu.
- **Idempoten dan tahan offline.** ID dibuat di app (`expo-crypto`) dan disimpan dengan `upsert … on conflict do nothing`; tulisan saat offline masuk antrean di `expo-sqlite` dan dikirim begitu online.
- **Angka turunan dihitung, bukan disimpan.** Streak, tren band, dan error per 100 kata dibaca dari view SQL, jadi tidak bisa tidak sinkron.
- **Backup mingguan.** Free plan tidak punya backup yang bisa diunduh, jadi `supabase db dump` dijalankan tiap minggu dan disimpan di tempat privat — bukan di repo publik.
- **Kapasitas.** Perkiraan kasar puluhan MB data per tahun, jauh di bawah 500 MB; audio yang dihapus setelah 30 hari memakai beberapa ratus MB dari kuota 1 GB.

**Deploy gratis:**

| Bagian | Cara | Batas penting |
| --- | --- | --- |
| Web | `npx expo export -p web`, lalu `eas deploy` ke EAS Hosting | 100.000 request/bulan, tanpa custom domain; alternatif Vercel Hobby atau Netlify |
| Android | APK dari EAS Build (15 build Android/bulan, antrean lambat) atau build lokal, lalu instal lewat ADB | Verifikasi developer Android berlaku di Indonesia sejak 30 September 2026; instal lewat ADB dikecualikan, dan akun limited distribution gratis untuk maksimal 20 perangkat |
| iOS | Xcode di Mac + Apple Account gratis | App berhenti setelah 7 hari dan harus diinstal ulang, maksimal 3 app per perangkat; tanpa Mac tidak ada jalur gratis |
| Backend | Supabase Free | 2 project, database 500 MB, storage 1 GB (maks. 50 MB per file), 500.000 panggilan Edge Functions |
| Update tanpa build ulang | EAS Update | Gratis sampai 1.000 pengguna aktif per bulan |
| Store (opsional) | Play Store $25 sekali; App Store $99/tahun | Akun Play pribadi baru wajib closed test dengan 12 tester selama 14 hari |

Urutannya: web dan Android dulu karena benar-benar gratis, iOS menyusul saat dibutuhkan. Selama development, iPhone tetap bisa dipakai lewat Expo Go untuk layar yang tidak butuh modul native tambahan; login Google butuh development build.

## Data model

Enam belas tabel cukup untuk MVP. `mistakes` adalah pusat tren kesalahan, sedangkan `band_scores` menyimpan semua estimasi band dan skor tes latihan.

| Tabel | Isi | Kolom kunci |
| --- | --- | --- |
| `profiles` | Profil & pengaturan | `id` (= auth user), `display_name`, `role` (user, admin), `ai_enabled`, `default_check` (ai, manual), `active_language`, `learning_languages`, `explain_lang`, `daily_budget_usd` |
| `allowed_emails` | Daftar undangan untuk hook pendaftaran | `email`, `invited_by`, `invited_at` |
| `exam_plans` | Rencana persiapan test | `user_id`, `target_language`, `exam` (`ielts`), `module` (`academic`, `general_training`, null), `target_band`, `start_date`, `final_mock_date` |
| `curriculum_units` | Silabus per minggu | `target_language`, `exam`, `week`, `topic`, `module` (null = untuk dua modul), `focus` (jsonb: tipe soal, pola, kosakata) |
| `lessons` | Isi pelajaran yang sudah dicek | `unit_id`, `position`, `skill` (listening, reading, writing, speaking, language), `kind` (lesson, checkpoint, mock), `content` (jsonb), `content_version` |
| `lesson_progress` | Progres per pelajaran | `id` (dibuat di app), `user_id`, `lesson_id` (unik bersama `user_id`), `status`, `score`, `completed_at` |
| `prompts` | Bank soal Writing & Speaking | `target_language`, `task` (writing\_task1\_academic, writing\_task1\_gt, writing\_task2, speaking\_part1, speaking\_part2, speaking\_part3, free\_writing, free\_speaking), `essay_type`, `topic`, `content` (jsonb: soal, poin kartu topik, data grafik, contoh jawaban band 7–8), `time_limit_s`, `min_words` |
| `practice_sessions` | Satu sesi latihan | `user_id`, `target_language`, `mode` (diagnostic, lesson, writing, speaking, conversation, mock, free), `prompt_id`, `lesson_id` |
| `attempts` | Satu jawaban teks/audio | `id` (dibuat di app), `session_id`, `status`, `check_mode` (manual, ai, both), `self_review` (jsonb: checklist, band sendiri per kriteria), `raw_text`, `word_count`, `time_spent_s`, `audio_path`, `transcript`, `duration_ms`, `wpm`, `filler_count`, `long_pause_count` |
| `feedback` | Hasil AI per attempt | `attempt_id` (unique), `model`, `prompt_version`, `payload` (jsonb), `improved` |
| `band_scores` | Estimasi band dan skor tes latihan | `user_id`, `source` (attempt, self, checkpoint, mock), `skill`, `criterion` (null = band bagian), `band`, `raw_score` (Listening/Reading, 0–40), `is_estimate`, `attempt_id`, `recorded_at` |
| `mistake_categories` | Taksonomi kesalahan per bahasa | `target_language`, `slug`, `label`, `criterion`, `sort_order` |
| `mistakes` | Satu koreksi = satu baris | `attempt_id`, `target_language`, `source` (ai, self, lesson), `category_id`, `subcategory`, `original_span`, `corrected_span`, `severity` (error, unnatural), `status` |
| `review_cards` | Kartu SRS | `target_language`, `mistake_id` atau `lesson_id`, `card_type` (cloze, choice, reorder, dictation), `front`, `back`, `due`, `fsrs` (jsonb), `version` |
| `review_logs` | Riwayat review | `id` (dibuat di app), `card_id`, `rating` (1–4), `reviewed_at`, `fsrs_log` (jsonb) |
| `ai_calls` | Log setiap panggilan AI | `user_id`, `purpose`, `provider`, `model`, `input_tokens`, `output_tokens`, `audio_seconds`, `cost_usd`, `latency_ms`, `status` |

Data grafik untuk Writing Task 1 Academic disimpan di `prompts.content` dan dirender sebagai SVG di Fase 2, jadi tidak butuh tabel baru.

**Keputusan desain:**

- **`mistakes` dinormalisasi, bukan hanya di jsonb** — tren per kategori di-query setiap hari, jadi butuh kolom dan index sungguhan.
- **`band_scores` terpisah dari `feedback`** — grafik progres cukup membaca satu tabel, dan `is_estimate` memisahkan estimasi AI dari skor objektif tes latihan resmi supaya keduanya tidak tercampur tanpa label.
- **Band dihitung di kode, bukan oleh LLM** — model hanya memberi band per kriteria. Rata-rata, bobot Task 2 yang lebih besar, dan pembulatan overall (rata-rata berakhiran .25 naik ke setengah band, .75 naik ke band bulat berikutnya) dihitung deterministik. Bobot persis Task 1 dan Task 2 tidak dipublikasikan, jadi app memakai asumsi 1:2 yang ditulis di config.
- **Kategori di tabel `mistake_categories` per bahasa, dengan kolom `criterion`** — tren bisa dibaca per kategori maupun per kriteria IELTS, dan bahasa baru cukup menambah baris, bukan mengubah enum.
- **`target_language` didenormalisasi ke `mistakes` dan `review_cards`** — query harian seperti "kartu jatuh tempo untuk bahasa aktif" tidak perlu join ke sesi.
- **Payload feedback lengkap + `prompt_version` disimpan** — input lama bisa dijalankan ulang dengan prompt baru untuk uji regresi.
- **State FSRS disimpan sebagai jsonb, `due` sebagai kolom terindeks** — schema tidak terikat versi library, sedangkan query "kartu jatuh tempo hari ini" tetap cepat.
- **`attempts.status`** (`pending`, `done`, `failed`) — jawaban yang kena rate limit diproses ulang nanti, bukan hilang.
- **`cost_usd` tetap diisi di free tier** — dihitung dengan harga paid tier sebagai biaya-ekuivalen, sehingga keputusan upgrade di Gate 1 berbasis pemakaian nyata.
- **Index:** `review_cards (user_id, target_language, due)`, `mistakes (user_id, target_language, category_id, created_at)`, `band_scores (user_id, skill, recorded_at)`, dan `ai_calls (user_id, created_at)` untuk cek kuota dan anggaran harian.
- **RLS di semua tabel** dengan `user_id = auth.uid()`; `prompts`, `curriculum_units`, `lessons`, dan `mistake_categories` bisa dibaca semua pengguna terautentikasi tapi hanya ditulis admin. Semua foreign key ke pengguna memakai on delete cascade agar hapus akun bersih, dan rating review dari app ditulis lewat fungsi record\_review.
- **Retensi audio:** file audio dihapus otomatis setelah 30 hari oleh job terjadwal; transkrip dan feedback tetap disimpan.

## Desain AI: prompt, output, evaluasi, biaya

Kualitas koreksi adalah produk inti, jadi diperlakukan seperti kode: punya schema, versi, dan test. Selama Fase 0–1 biayanya $0 dengan free tier Gemini; estimasi biaya di bawah berlaku jika nanti pindah ke paid tier.

### Schema feedback

Dikirim sebagai structured output Gemini sehingga respons berupa JSON yang mengikuti schema ([Gemini docs](https://ai.google.dev/gemini-api/docs/structured-output)). Schema yang sama dipakai untuk semua provider, jadi hasil eval antar-model bisa dibandingkan langsung.

```ts
type Feedback = {
  task: "writing_task1" | "writing_task2" | "speaking_part1" | "speaking_part2" | "speaking_part3" | "lesson";
  criteria: Array<{
    criterion: "task" | "coherence" | "lexical" | "grammar" | "fluency" | "pronunciation";
    band: number;          // 0–9, kelipatan 0.5
    evidence: string[];    // kutipan persis dari jawaban
    reason: string;        // merujuk descriptor band itu, maks 2 kalimat
    next_step: string;     // satu perubahan paling berdampak untuk naik setengah band
  }>;
  corrections: Array<{
    original: string;      // potongan persis dari input
    corrected: string;
    category: "grammar" | "word_choice" | "collocation" | "cohesion" | "register" | "fluency" | "pronunciation";
    subcategory: string;   // mis. "article", "preposition", "tense"
    severity: "error" | "unnatural";
    explanation: string;   // maks 2 kalimat
  }>;
  improved: string;        // versi band 7–8 yang tetap memakai idemu
  strengths: string[];     // maks 2, spesifik
  overall: string;         // 1–2 kalimat
};
```

- **Semua field required** — batas seperti panjang atau jumlah maksimum dicek di kode, karena dukungan JSON Schema berbeda-beda antar provider.
- **Validasi ulang dengan Zod di server** — output model tidak dipercaya mentah-mentah; nilai enum dinormalisasi ke lowercase dan band dibulatkan ke kelipatan 0.5 sebelum disimpan.
- **Guard halusinasi** — koreksi yang `original`-nya tidak ditemukan persis di input dibuang dan dicatat; band kriteria tanpa `evidence` yang valid ditandai tidak andal dan tidak masuk grafik progres.
- **Pronunciation tidak dinilai dari transkrip** — teks tidak membawa informasi pengucapan. Di MVP kriteria ini dinilai dari audio oleh model multimodal dengan label eksperimental, lalu diganti Azure Pronunciation Assessment di Fase 2 jika uji menunjukkan hasilnya lebih konsisten.

### Prinsip prompt

- **Konteks personal** — target band, task yang dikerjakan, kriteria terlemah, dan 5 kategori kesalahan paling sering dari database.
- **Rubrik = band descriptors publik** — prompt memuat descriptor band 6–8 untuk tiap kriteria, dan model harus mengutip bukti dari jawaban sebelum memberi angka.
- **Pisahkan error dari gaya** — hanya tandai yang akan disadari native speaker; jangan menulis ulang suara pengguna.
- **Urutkan berdasarkan dampak** — maksimal 5 koreksi per jawaban.
- **Transkrip diperlakukan sebagai ucapan** — tanda baca dan kapitalisasi hasil STT tidak dikoreksi.
- **Input pengguna = data** — dibungkus tag dan instruksi di dalamnya diabaikan; relevan saat app dipamerkan publik.
- **Prompt diversi di repo** (`prompts/feedback.v1.md`) dan versinya disimpan di setiap baris `feedback`.

### Evaluasi

Eval suite ini bagian paling bernilai untuk portofolio AI engineering, sekaligus pengaman saat ganti prompt atau model.

- **Golden set ±60 item:** 25 tulisan dan transkrip milikmu yang dianotasi manual, 10 kalimat benar (seharusnya nol error), 10 kasus interferensi bahasa Indonesia (artikel hilang, "discuss about", tense, plural), dan 15 contoh jawaban resmi yang dipublikasikan bersama band dan komentar examiner. Contoh resmi itu disimpan privat, tidak di-commit ke repo publik.
- **Metrik:** precision koreksi, recall kesalahan yang diharapkan, false positive rate pada kalimat benar, selisih band (mean absolute error per kriteria dan persentase yang berada dalam ±0.5 band), konsistensi (essay yang sama dinilai 3 kali, sebaran ≤ 0.5 band), validitas schema, latency p95, dan biaya-ekuivalen per item.
- **Penilaian:** pencocokan span otomatis + LLM-as-judge untuk validitas koreksi, dengan cek manual acak sebagai ground truth.
- **Perbandingan provider:** golden set yang sama dijalankan ke Gemini 3.8 Flash, Gemini 3.5 Flash-Lite, dan — memakai kredit gratis pengguna baru Claude API — Claude Haiku 5.5 serta Sonnet 5.5. Hasilnya jadi dasar keputusan di Gate 1 sekaligus bahan portofolio.
- **Kapan dijalankan:** setiap perubahan prompt atau model, lewat satu perintah (`npm run eval`) dengan jeda antar-request agar tidak menabrak rate limit free tier; hasil disimpan untuk dibandingkan antarversi.

### Estimasi biaya

Fase 0–1 berjalan di free tier, jadi biaya riilnya $0. Tabel ini memperkirakan biaya jika nanti pindah ke paid tier, dihitung dari harga resmi per 2 November 2026; angka aktual tetap tercatat di `ai_calls`.

| Aktivitas | Free tier (Fase 0–1) | Gemini paid tier | Alternatif berbayar |
| --- | --- | --- | --- |
| Feedback essay Task 2 ±280 kata | $0 | ±$0,01 dengan Gemini 3.8 Flash (harga mulai Januari 2027) | Claude Sonnet 5.5 ±$0,01; Haiku 5.5 < $0,001 |
| Speaking 1 menit, turn-based | $0 | ±$0,015 (Transcribe ±$0,005/menit + feedback) | ±$0,02 (gpt-transcribe + Sonnet 5.5) |
| Generate 5 kartu SRS | $0 | ±$0,002 dengan Flash-Lite | < $0,001 dengan Haiku 5.5 |
| Realtime 10 menit (Fase 2) | $0 | ±$0,12+ dengan Gemini 3.8 Live | ±$0,15–0,25 dengan gpt-realtime-2.1-mini |

- **Skenario harian di paid tier** (1 pelajaran + 1 essay atau 3 jawaban speaking + review) dengan Gemini ≈ $0,10/hari, sekitar $3/bulan.
- **Harga acuan Gemini:** 3.8 Flash $0,75/$3,75 per juta token sampai 31 Desember 2026, lalu $1,50/$7,50 mulai 1 Januari 2027; Transcribe sekitar $0,005/menit; Live audio $0,005/menit input dan $0,018/menit output ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)).
- **Harga acuan alternatif:** Sonnet 5.5 $2/$10 dan Haiku 5.5 $0,10/$0,50 per juta token ([Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)); transkripsi OpenAI $0,003–0,006/menit dan realtime mini $10/$20 per juta token audio ([OpenAI pricing](https://developers.openai.com/api/docs/pricing)).
- **Biaya realtime naik seiring panjang sesi** karena konteks percakapan ikut dihitung lagi setiap giliran ([contoh OpenAI](https://developers.openai.com/docs/guides/realtime-costs)); batasi durasi sesi.
- **Guard kuota & anggaran:** sebelum panggilan AI, cek jumlah request dan `cost_usd` hari ini; jika melewati batas, mode berat dinonaktifkan. Saat pindah ke paid tier, pasang juga spend limit di dashboard provider.

## Roadmap & alokasi waktu

Dengan 3–4 jam/minggu, MVP siap dipakai harian sekitar pertengahan Januari 2027, dan Fase 2 hanya dimulai jika gate pemakaian terpenuhi. Gate ini mencegah pola umum side project: fitur terus bertambah, tapi app-nya tidak pernah dipakai.

> **Diagram roadmap (Nov 2026 – Mei 2027, 3–4 jam/minggu):** Fase 0 Spike 2–15 Nov → Gate 0 (STT terpilih, eval v1 berjalan) → Fase 1 MVP 16 Nov–10 Jan → Masa pakai 11–24 Jan (minggu 1–2 IELTS) → Gate 1 (≥ 5 hari aktif/minggu selama 2 minggu dan precision koreksi ≥ 85%) → Fase 2 Simulasi test 25 Jan–21 Mar → Fase 3 Pemolesan 22 Mar–16 Mei (final mock 3 Apr).

Jika Gate 1 tidak terpenuhi, minggu berikutnya dipakai memperbaiki kegunaan MVP, bukan menambah fitur Fase 2.

**Isi tiap fase:**

- **Fase 0 — Spike (2 minggu):** repo Expo + Supabase + login Google (web dan Android) + deploy web kosong ke EAS Hosting + APK pertama di HP; cek hook pendaftaran undangan di free plan; API key Gemini dari Google AI Studio; uji Gemini 3.5 Transcribe vs Deepgram dengan 10 rekaman; prompt feedback v1 dengan rubrik band descriptors + 20 item eval pertama; cek TTS untuk audio Listening (dua pembicara, variasi aksen); silabus minggu 1–2 ditulis sebagai data.
- **Fase 1 — MVP (8 minggu):** Writing Task 2 Coach dengan timer, cek manual, dan cek AI (minggu 1–2), pelajaran harian + diagnostic + mesin soal tipe IELTS yang juga dipakai review (minggu 3–4), Speaking Part 1–3 turn-based dengan kartu topik, cek manual, dan cek AI (minggu 5–6), Mistake Bank + review FSRS + progress band + antrean offline + hapus akun (minggu 7–8). Kolom `target_language` dan interface `LanguagePack` ikut dibuat sejak awal.
- **Masa pakai (2 minggu) = minggu 1–2 simulasi IELTS:** mulai Senin 11 Januari 2027. App hanya dipakai dan diperbaiki bug-nya, tanpa fitur baru. Golden set dilengkapi menjadi ±60 item untuk keputusan provider di Gate 1. Konten unit berikutnya selalu disiapkan satu minggu di depan.
- **Fase 2 — Simulasi test (8 minggu, minggu 3–10 persiapan):** Writing Task 1 dikerjakan pertama karena dibutuhkan mulai minggu 5 (8 Februari 2027), lalu section practice Listening & Reading bertimer, mock test mode, realtime examiner dengan Gemini 3.8 Live, dan pronunciation scoring.
- **Fase 3 — Pemolesan (8 minggu):** final mock pada Sabtu 3 April 2027 jatuh di minggu kedua fase ini; setelahnya dictation & shadowing, mini lesson dari kesalahan, dan laporan mingguan. Setelah final mock, pilih: daftar test resmi atau ulangi siklus 12 minggu dengan fokus ke kriteria yang belum 7.0.
- **Setelah Fase 3 — Bahasa kedua:** Arab atau Mandarin, ditambahkan sebagai language pack baru dengan kurikulum dan golden set sendiri.


## Metrik keberhasilan & verifikasi

App berhasil jika dua hal terbukti: kamu memakainya rutin, dan band bergerak menuju 7.0 — baik estimasi AI untuk Writing dan Speaking maupun skor tes latihan resmi untuk Listening dan Reading. Target di bawah adalah titik awal yang disesuaikan setelah diagnostic.

| Metrik | Yang diukur | Target awal | Sumber data |
| --- | --- | --- | --- |
| Hari aktif per minggu | Kebiasaan | ≥ 5 hari (syarat Gate 1) | `practice_sessions` |
| Pelajaran selesai per minggu | Konsistensi kurikulum | 5 pelajaran + 1 checkpoint | `lesson_progress` |
| Akurasi drill per tipe soal | Strategi Listening & Reading | ≥ 70% per tipe soal; di bawahnya masuk review minggu berikutnya | `lesson_progress` |
| Skor tes latihan resmi | Listening & Reading secara objektif | Sekitar 30/40 untuk band 7 di Listening dan Academic Reading, sekitar 35/40 di General Training Reading | `band_scores` |
| Estimasi band per kriteria | Writing & Speaking | Semua kriteria ≥ 7.0 di final mock; dibaca sebagai tren 3 minggu, bukan angka harian | `band_scores` |
| Selisih band sendiri vs AI | Kemampuan menilai jawaban sendiri | Mengecil tiap bulan; ≤ 0.5 per kriteria menjelang final mock | `band_scores` (source self vs attempt) |
| Error per 100 kata | Akurasi grammar | Turun 30% dalam 12 minggu | `mistakes`, `attempts.word_count` |
| Recurring rate | Belajar dari kesalahan | Persentase kesalahan dengan subkategori lama turun tiap bulan | `mistakes` |
| Filler & jeda > 2 detik per menit | Fluency | Turun pada pertanyaan Part 2 yang setara | `attempts` |
| Retensi review | Daya ingat | Mendekati target retensi yang diset di FSRS (mis. 90%) | `review_logs` |
| Rekaman benchmark Part 2 | Kemajuan nyata | Kartu topik yang sama di minggu 0, 6, dan 12, didengar ulang berdampingan | `attempts` |
| Precision koreksi | Kualitas AI | ≥ 85% di golden set | Eval suite |
| False positive kalimat benar | Over-correction | ≤ 10% | Eval suite |
| Selisih band dengan examiner | Kalibrasi AI | Mean absolute error ≤ 0.5 per kriteria pada contoh berband | Eval suite |
| Latency feedback p95 | UX | Essay Task 2 < 10 detik; speaking < 10 detik setelah rekaman berhenti | `ai_calls` |
| Biaya bulanan | Keberlanjutan | $0 selama Fase 0–1; ≤ $10 jika upgrade | `ai_calls` |

**Strategi testing:**

- **Unit** — perhitungan WPM, filler, jeda; penghitung kata; perhitungan dan pembulatan band; wrapper FSRS; guard anggaran; guard halusinasi koreksi dan bukti band.
- **Integration** — Edge Function dengan provider AI di-mock memakai fixture respons; uji policy RLS di Supabase lokal (user A tidak bisa membaca data user B).
- **E2E** — Playwright untuk versi web (Writing bertimer dan Speaking Part 2 dengan fake media stream dan jam palsu); Maestro di laptop untuk login dan rekam di Android, karena Maestro tidak termasuk EAS free.
- **AI regression** — eval suite dijalankan di CI setiap kali prompt atau model berubah.

**Acceptance criteria MVP:**

- [ ] Login Google jalan di web dan Android; progres yang dibuat di HP muncul di web, dan sebaliknya
- [ ] Email di luar daftar undangan ditolak saat mendaftar
- [ ] Diagnostic menghasilkan baseline band per bagian dan per kriteria; skor mentah Listening & Reading dari tes latihan resmi bisa diinput dan dikonversi ke perkiraan band
- [ ] Pelajaran harian berjalan 4 langkah (input, notice, practice, produce), dan kosakata barunya masuk antrean review
- [ ] Checkpoint di bawah ambang memasukkan materi unit itu ke review dan drill minggu berikutnya tanpa menggeser jadwal 12 minggu
- [ ] Writing Task 2: timer 40 menit, penghitung kata, dan spell-check serta autocorrect nonaktif; essay 280 kata menghasilkan estimasi band per kriteria + koreksi valid dalam < 10 detik (p95)
- [ ] Speaking Part 2: kartu topik, 1 menit persiapan, rekaman berhenti otomatis di 2 menit; rekaman di Android, iOS (development build), dan Chrome web berhasil ditranskrip dan dinilai
- [ ] Cek manual jalan tanpa satu pun panggilan AI: statistik essay, checklist per kriteria, contoh jawaban band 7–8, band sendiri, dan kesalahan yang ditandai sendiri masuk Mistake Bank serta jadi kartu review
- [ ] Saat AI tidak tersedia (kuota habis, offline, atau ai\_enabled mati), app langsung menawarkan cek manual, dan jawaban bisa dicek AI nanti tanpa diketik ulang
- [ ] Setiap estimasi band berlabel "estimasi" atau "self-check" dan tidak tercampur di grafik Progress
- [ ] Setiap koreksi tersimpan di Mistake Bank dan menghasilkan minimal satu kartu review
- [ ] Review harian menampilkan kartu jatuh tempo sesuai jadwal FSRS
- [ ] Rating review yang terkirim dua kali tercatat sekali, dan jawaban yang dibuat saat offline terkirim begitu online
- [ ] Hapus akun menghapus user, semua baris, dan file audio
- [ ] Error 429 dari free tier ditangani dengan retry + backoff tanpa kehilangan jawaban pengguna
- [ ] Guard kuota memblokir panggilan setelah batas harian per pengguna dan menampilkan pesan yang jelas
- [ ] Eval suite berjalan dengan satu perintah dan memenuhi target precision serta selisih band

## Risiko & mitigasi

Risiko terbesar bukan teknis, melainkan scope: membangun semua modul sekaligus dengan waktu 3–4 jam per minggu. Dengan free tier, privasi data latihan menjadi risiko kedua yang harus dijaga sejak hari pertama. Untuk persiapan IELTS, risiko ketiga adalah terlalu percaya pada estimasi band dari AI.

| Risiko | Dampak | Kemungkinan | Mitigasi |
| --- | --- | --- | --- |
| Scope creep | App tidak dipakai, atau fitur Fase 2 belum siap saat dibutuhkan kurikulum | Tinggi | Timebox 3–4 jam/minggu, MVP fokus Writing dan Speaking, Gate 1 sebelum fitur baru; setup Expo dan login dikerjakan di Fase 0 dengan iOS ditunda; jika Task 1 atau section practice terlambat, pakai tes latihan resmi dulu |
| Data latihan dipakai Google dan bisa dibaca reviewer (free tier) | Informasi pribadi bocor, terutama dari jawaban Speaking Part 1 | Pasti terjadi jika data itu dikirim | Jawab dengan detail yang tidak mengidentifikasi (tanpa nama, nama kantor, alamat); pindah ke paid tier sebelum dibuka untuk pengguna lain. Terms Gemini sendiri melarang data sensitif di layanan gratis ([terms](https://ai.google.dev/gemini-api/terms)) |
| Estimasi band AI meleset | Rasa percaya diri palsu, atau panik yang tidak perlu menjelang test | Sedang | Label "estimasi", wajib kutipan bukti, kalibrasi dengan contoh berband (target selisih ≤ 0.5), baca tren 3 minggu. Studi 2024 menemukan GPT-4 umumnya selaras dengan examiner untuk Task 2, tapi tetap ada selisih dan outlier di beberapa essay ([Koraishi, 2024](https://avesis.uludag.edu.tr/yayin/9610a41d-001d-4f22-834e-579fe0ae99dd/the-intersection-of-ai-and-language-assessment-a-study-on-the-reliability-of-chatgpt-in-grading-ielts-writing-task-2)). Studi lain menemukan ChatGPT-3.5 cenderung memberi skor lebih rendah dari examiner resmi ([IJATE](https://www.citedrive.com/en/discovery/chatgpt-35-as-an-automatic-scoring-system-and-feedback-provider-in-ielts-exams)), dan tinjauan Saricaoglu & Bilki (2025) mencatat skor ChatGPT tidak selalu konsisten antar-percobaan ([Cambridge](https://www.cambridge.org/core/product/DD86884CA838040DB2A910AE77995B05/core-reader)). Karena itu eval juga mengukur konsistensi. Keputusan mendaftar test diambil dari mock dan tes latihan resmi, bukan angka AI semata |
| Koreksi AI salah atau berlebihan | Belajar hal yang keliru, kehilangan kepercayaan | Sedang | Pisahkan error vs unnatural, maks 5 koreksi, eval false positive, bandingkan model lewat eval, tombol "koreksi ini salah" yang masuk ke golden set |
| Soal Reading/Listening dan materi pelajaran buatan AI ambigu atau levelnya tidak pas | Belajar strategi tipe soal yang keliru | Tinggi untuk True/False/Not Given, sedang untuk lainnya | Setiap soal wajib menyertakan kutipan bukti dan dicek manual sebelum dipakai; soal AI hanya untuk drill, ukuran band dari tes latihan resmi; kosakata dicek ke English Vocabulary Profile; tombol "laporkan soal" |
| Materi berhak cipta masuk repo publik | Masalah hak cipta saat dipamerkan sebagai portofolio | Sedang | Bank soal ditulis sendiri atau dibuat AI; buku Cambridge dan tes latihan resmi dipakai di luar app dan hanya skornya yang dicatat; contoh berband untuk eval disimpan privat |
| Free tier berubah, rate limit diturunkan, atau project Supabase di-pause | Fitur berhenti tiba-tiba atau riwayat progres hilang | Sedang | Interface provider-agnostic, retry + antrean `pending`, cadangan Deepgram dan Claude API; app dipakai harian dan database di-backup mingguan dengan supabase db dump |
| STT merapikan kesalahan dan filler | Feedback dan estimasi Fluency melewatkan kesalahan nyata | Sedang | Kriteria spike error preservation; tampilkan transkrip dan izinkan menandai kata yang salah dengar |
| Skor pronunciation menyesatkan | Fokus latihan salah arah | Sedang | Label eksperimental di MVP; skor Azure pun disarankan dibaca sebagai tren ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5724994/question-about-the-reliability-of-azure-pronunciat)) |
| Bahasa kedua lebih sulit dari perkiraan (kanan-ke-kiri, tanpa spasi antar kata, kualitas model) | Tampilan rusak atau koreksi tidak akurat di bahasa baru | Sedang | Fondasi multi-bahasa sejak MVP, eval terpisah per bahasa, bahasa baru dirilis hanya jika lolos target precision-nya sendiri |
| Latency atau kuota realtime | Sesi examiner terasa lambat atau terputus | Sedang | Batas sesi 15 menit (sepanjang Speaking test), ringkas konteks percakapan, fallback ke mode turn-based; modul streaming audio untuk iOS dan Android diuji di awal Fase 2 |
| Format rekaman berbeda per platform | Speaking gagal di iOS, Android, atau web | Sedang | Uji di tiga platform sejak Fase 0; Gemini menerima M4A dan WebM tanpa konversi; di Android pakai preset HIGH\_QUALITY |

## Keputusan terbuka & langkah berikutnya

Sembilan keputusan belum perlu diambil hari ini; masing-masing punya waktu yang tepat. Yang perlu dilakukan minggu ini hanyalah persiapan Fase 0.

| Keputusan | Opsi | Rekomendasi | Kapan |
| --- | --- | --- | --- |
| Modul IELTS | Academic atau General Training | Tentukan dari negara tujuan. Kanada (Express Entry) hanya menerima General Training ([IDP](https://ielts.idp.com/canada/prepare/article-what-is-the-minimum-ielts-score-to-get-canada-pr-and-work-there)); Australia menerima keduanya ([IELTS Australia](https://ielts.com.au/australia/prepare/article-english-language-requirements-for-australia)); visa kerja Inggris memakai IELTS for UKVI, versi Academic atau General Training dengan format yang sama ([British Council](https://takeielts.britishcouncil.org/en-gb/what-is-ielts/how-it-works/test-types/ielts-ukvi-selt)). Jika masih menimbang kuliah atau kerja dan tujuannya bukan Kanada, Academic menjaga dua pilihan tetap terbuka. Listening, Writing Task 2, dan Speaking sama untuk keduanya | Checkpoint minggu 4 (Sabtu 6 Februari 2027) |
| Target band | 7.0 sementara, atau sesuai syarat tujuan | 7.0 di setiap bagian setara level Proficient untuk visa skilled Australia; Express Entry Kanada minimal CLB 7, yaitu 6.0 di setiap bagian. Kampus biasanya mensyaratkan overall dan nilai minimum per bagian, jadi simpan keduanya di `exam_plans` | Setelah diagnostic, lalu dicek lagi saat negara atau kampus tujuan jelas |
| Daftar test resmi | Daftar setelah final mock, atau ulangi siklus | Daftar jika final mock dan dua tes latihan resmi terakhir stabil di ≥ 7.0. Test di Indonesia kini berbasis komputer; cek lokasi pusat tes terdekat di situs British Council dan IDP. Untuk visa, test harus di pusat tes: IELTS Online tidak diterima untuk visa Australia, dan Inggris mensyaratkan pemesanan IELTS for UKVI | Setelah 3 April 2027 |
| Provider STT | Gemini 3.5 Transcribe atau Deepgram Nova-3 | Pilih dari hasil spike, bukan harga semata | Akhir Fase 0 |
| Tetap free tier atau upgrade | Gemini free, Gemini paid, atau Claude | Putuskan dari hasil eval perbandingan dan kebutuhan privasi | Gate 1 |
| Distribusi iOS | Xcode gratis (butuh Mac, instal ulang tiap 7 hari) atau Apple Developer Program $99/tahun | Mulai dari web dan Android; iOS lewat Xcode jika ada Mac. Jika nanti rilis di App Store dengan login Google, tambahkan Sign in with Apple | Saat iOS benar-benar dibutuhkan |
| Buka untuk pengguna lain | Tetap undangan, atau terbuka | Teman bisa diundang lebih awal dalam mode manual saja (ai\_enabled mati), karena tidak ada data mereka yang dikirim ke Gemini. Cek AI untuk mereka baru dibuka setelah Gemini paid tier, kuota per pengguna, hapus akun di app plus link web, dan kebijakan privasi siap | Setelah Gate 1 |
| Bentuk portofolio | Akses publik atau repo + demo | Repo publik + video demo + laporan eval; akses publik untuk pengguna lain wajib paid tier agar data mereka tidak dipakai melatih model | Setelah Gate 1 |
| Bahasa kedua | Arab atau Mandarin | Pilih yang paling sering kamu butuhkan; Arab butuh tampilan kanan-ke-kiri, Mandarin butuh hitungan per karakter dan feedback nada | Setelah Fase 3 |

**Minggu ini:**

- [ ] Kerjakan satu tes latihan resmi gratis (Listening dan Reading) sebagai gambaran awal sebelum app jadi
- [ ] Buat repo Expo, project Supabase, dan deploy web kosong ke EAS Hosting
- [ ] Buat OAuth client ID Google (web dan Android) dan aktifkan provider Google di Supabase
- [ ] Buat API key Gemini di Google AI Studio dan cek rate limit project-nya
- [ ] Rekam 10 jawaban Speaking Part 2 (1–2 menit) di HP dan laptop, dengan beberapa kesalahan disengaja, untuk spike STT
- [ ] Tulis 2 essay Task 2 bertimer sebagai eval awal dan bahan diagnostic
- [ ] Tulis schema Zod + prompt feedback v1 dengan rubrik band descriptors
- [ ] Tulis aturan "tanpa data pribadi dan tanpa materi berhak cipta" di README
- [ ] Blok 2 slot tetap per minggu di kalender untuk proyek ini

## Sumber

Harga dan fitur terakhir dicek 2 November 2026.

- [IELTS — test format (British Council)](https://takeielts.britishcouncil.org/take-ielts/test-format)
- [IELTS Australia — test format: durasi per part dan jumlah kata](https://www.ielts.com.au/australia/about/what-is-ielts/ielts-test-format)
- [IELTS Writing band descriptors (diperbarui Mei 2023)](https://ielts.org/cdn/ielts-downloadable-assets/ielts-guidance-and-support/ielts-guides/ielts-writing-band-descriptors.pdf)
- [IELTS Speaking band descriptors](https://ielts.org/cdn/ielts-downloadable-assets/ielts-guidance-and-support/ielts-guides/ielts-speaking-band-descriptors.pdf)
- [IELTS — scoring in detail: pembulatan band dan konversi skor mentah](https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail)
- [IELTS — IELTS and the CEFR](https://ielts.org/news-and-insights/everything-you-need-to-know-about-ielts-and-the-cefr)
- [IDP — IELTS Listening question types](https://ielts.idp.com/prepare/article-question-types-listening)
- [IELTS Australia — IELTS Reading question types](https://ielts.com.au/australia/prepare/article-ielts-reading-question-types)
- [British Council — free IELTS practice tests](https://takeielts.britishcouncil.org/prepare-test/free-practice-tests)
- [British Council Indonesia — IELTS dates, fees, locations](https://www.britishcouncilfoundation.id/en/exam/ielts/dates-fees-locations)
- [Koraishi (2024) — reliability of ChatGPT in grading IELTS Writing Task 2](https://avesis.uludag.edu.tr/yayin/9610a41d-001d-4f22-834e-579fe0ae99dd/the-intersection-of-ai-and-language-assessment-a-study-on-the-reliability-of-chatgpt-in-grading-ielts-writing-task-2)
- [IJATE — ChatGPT-3.5 as an automatic scoring system and feedback provider in IELTS exams](https://www.citedrive.com/en/discovery/chatgpt-35-as-an-automatic-scoring-system-and-feedback-provider-in-ielts-exams)
- [Saricaoglu & Bilki (2025) — the capacity of ChatGPT-4 for L2 writing assessment](https://www.cambridge.org/core/product/DD86884CA838040DB2A910AE77995B05/core-reader)
- [IDP — IELTS for Canada PR: hanya General Training untuk Express Entry](https://ielts.idp.com/canada/prepare/article-what-is-the-minimum-ielts-score-to-get-canada-pr-and-work-there)
- [IELTS Australia — English language requirements for Australia](https://ielts.com.au/australia/prepare/article-english-language-requirements-for-australia)
- [British Council — IELTS for UKVI](https://takeielts.britishcouncil.org/en-gb/what-is-ielts/how-it-works/test-types/ielts-ukvi-selt)
- [English Profile (English Grammar Profile & English Vocabulary Profile)](https://en.wikipedia.org/wiki/English_Profile)
- [Expo — pricing (EAS Build, Update, Hosting)](https://expo.dev/pricing.md)
- [Expo — expo-audio](https://docs.expo.dev/versions/latest/sdk/audio.md)
- [Supabase — Edge Functions limits](https://supabase.com/docs/guides/functions/limits.md)
- [Supabase — Background Tasks](https://supabase.com/docs/guides/functions/background-tasks.md)
- [Supabase — Login with Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google.md)
- [Supabase — Before User Created hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook.md)
- [CostBench — Supabase Free plan](https://costbench.com/software/database-as-service/supabase/free-plan/)
- [Gemini API — audio understanding (format yang didukung)](https://ai.google.dev/gemini-api/docs/audio?lang=rest)
- [Google Play — syarat testing akun pribadi baru](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Google Play — app account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-GB)
- [Google — Android developer verification](https://support.google.com/android-developer-console/answer/16561738?hl=en)
- [Apple — Guideline 5.1.1(v) account deletion](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion)
- [PTKD — ringkasan App Store guideline 4.8](https://ptkd.com/app-store/guidelines/4-8)
- [Newly — instal app di HP sendiri](https://newly.app/guides/test-on-your-own-phone)
- [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms)
- [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI Realtime API — managing costs](https://developers.openai.com/docs/guides/realtime-costs)
- [Deepgram — Filler Words](https://developers.deepgram.com/docs/filler-words)
- [Microsoft Q&A — reliability of Azure Pronunciation Assessment scores](https://learn.microsoft.com/en-us/answers/questions/5724994/question-about-the-reliability-of-azure-pronunciat)
- [ts-fsrs (FSRS v6 untuk TypeScript)](https://github.com/open-spaced-repetition/ts-fsrs)
