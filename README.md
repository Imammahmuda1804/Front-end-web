# RANAHINSIGHT Web Service

Folder `web` berisi aplikasi web RANAHINSIGHT berbasis Next.js App Router. Web ini menyediakan halaman publik untuk user dan dashboard admin untuk mengelola destinasi, review, topik, NLP, scraper, user, serta analytics.

## Kegunaan Service

Web dipakai untuk:

- landing page RANAHINSIGHT;
- katalog semua destinasi publik;
- pencarian destinasi keyword dan semantic;
- detail destinasi dengan gallery, topic insight, review, dan favorite;
- compare destinasi;
- profile dan favorite user;
- route wisata shareable, route tersimpan, dan route builder;
- login user/admin;
- dashboard admin;
- CRUD destinasi;
- manajemen review dan topic;
- upload data NLP;
- monitoring scraper;
- manajemen user.

Web tidak memanggil Python Model langsung. Semua request data dikirim ke backend NestJS.

## Syarat Sistem

Disarankan:

- Node.js 20 atau lebih baru.
- npm.
- Backend berjalan di `http://localhost:3000`.
- Browser modern.

Versi utama yang dipakai:

- Next.js 16.
- React 19.
- TanStack Query.
- Axios.
- Tailwind CSS.
- Recharts.
- Framer Motion.
- GSAP masih tersedia untuk komponen `TrendingCarousel`, tetapi landing aktif memakai hero pencarian berbasis Framer Motion.
- Zustand.
- `@react-oauth/google` untuk tombol Google login.

## Instalasi dari Clone Baru

Masuk folder web:

```powershell
cd "D:\Kuliah\Ta\New folder\web"
```

Install dependency:

```powershell
npm install
```

Jika backend berjalan di URL berbeda, buat `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Jika tidak ada `.env.local`, cek `src/lib/axios.ts` untuk fallback base URL.

## Menjalankan Web

Development:

```powershell
npm run dev
```

Jika port `3000` sedang dipakai backend, Next.js biasanya pindah ke `3001`.

Build production:

```powershell
npm run build
npm run start
```

URL umum:

```txt
http://localhost:3001
```

## Dependency Service Lain

| Service | Kebutuhan |
| --- | --- |
| Backend NestJS | Wajib untuk semua data, auth, admin, search, dan upload. |
| Model Python | Tidak dipanggil langsung, tetapi backend perlu Model untuk NLP/semantic. |
| PostgreSQL | Tidak dipakai langsung oleh web. |
| Redis | Tidak dipakai langsung oleh web. |

## Fitur Route Wisata

Route wisata memakai data `latitude`, `longitude`, `googleMapsUrl`, dan `googlePlaceId` dari destinasi.

- `/routes`: katalog route publik dan route tersimpan user.
- `/routes/saved`: tracker rute tersimpan untuk menandai stop yang sudah dikunjungi dan melihat tujuan berikutnya.
- `/routes/me`: route buatan user login dan entry edit route milik user.
- `/routes/new`: builder route manual dengan auto sort dari backend dan dropdown `NativeSelect` yang sama untuk user/admin.
- `/routes/[shareSlug]`: halaman share route public/link-only.
- `/admin/routes`: curated route yang dibuat admin, termasuk edit, publish/unpublish, dan delete.

Tombol "Tambahkan ke rute" tersedia dari detail destinasi dan favorite card. Detail destinasi juga menampilkan Google Maps dan destinasi terdekat saat koordinat tersedia.

Progress rute tersimpan disimpan di backend, sehingga status kunjungan tetap tersedia lintas browser atau device setelah user login. Halaman detail route menampilkan penanda jika route sudah disimpan dan menyediakan action hapus simpanan. Fitur salinan route tidak ditampilkan di UI karena action simpan sudah cukup untuk workflow user.

## Tampilan Public Shell

Halaman publik memakai turunan foto Ngarai Sianok yang sudah dioptimalkan pada `public/images/sumbar-tourism-bg-optimized.jpg`. Overlay dibuat tipis agar halaman eksplorasi, katalog destinasi, route, compare, profile, dan detail tetap memiliki konteks wisata tanpa mengurangi keterbacaan. Navbar public memakai satu glass surface semi transparan, active indicator sederhana, dan radius yang lebih kecil supaya tidak terasa seperti kumpulan pill.

Katalog destinasi memakai `DestinationCatalogCard` yang berbeda dari kartu hasil pencarian. Gambar dibuat dominan, tinggi konten stabil, topik dibatasi satu, dan action disusun konsisten agar grid mudah dipindai.

Detail destinasi membaca topik dari backend sebagai topic group, fine topic,
dan review per topik. Jika backend mengirim metadata multi-aspect assignment,
review terkait topik menampilkan badge `Topik utama` atau `Aspek tambahan`
beserta confidence agar user/admin paham kenapa satu ulasan bisa masuk ke lebih
dari satu topik.

Atribusi background: `Ngarai Sianok Bukittinggi.jpg`, Wikimedia Commons, CC BY-SA 4.0.

## Landing Page

Landing page memakai hero fotografis yang fokus pada satu pekerjaan utama: mencari destinasi. Hero menampilkan headline singkat, satu penjelasan, dan form pencarian. Rekomendasi, insight, dan penjelasan fitur ditempatkan setelah first viewport agar tidak bersaing dengan pencarian.

Animasi hero dibatasi pada kemunculan copy dan zoom awal gambar, memakai properti transform/opacity dan menghormati `prefers-reduced-motion`.

## Fitur Compare

Halaman `/compare` memakai endpoint `/api/analytics/compare` untuk menampilkan ringkasan keputusan, best-for chips, factor matrix, highlight, risiko, lokasi/maps, chart sentimen, dan topik dominan. Field tambahan compare bersifat additive sehingga fallback lama tetap aman jika backend belum mengirim insight lengkap.

## Struktur Folder

| Path | Kegunaan |
| --- | --- |
| `src/app/` | Route App Router Next.js. |
| `src/app/layout.tsx` | Root layout, metadata, dan provider global. |
| `src/app/(public)/` | Route publik seperti home, search, detail, compare, profile, favorites. |
| `src/app/(auth)/` | Route login dan register. |
| `src/app/admin/` | Route dashboard admin. |
| `src/app/api/revalidate/` | Route internal revalidation. |
| `src/components/` | Komponen UI public, admin, layout, chart, dan primitive. |
| `src/components/home/` | Hero pencarian fotografis, info section, dan bento landing. |
| `src/components/search/` | Search workspace, command surface, panel filter/history, result card, state kosong/loading reusable, helper API lokal, type lokal, konstanta prompt, dan helper normalisasi. |
| `src/components/destinations/` | Detail destinasi, hero/detail nav presentational, gallery, topic insight dengan helper/type terpisah, review form, helper/type lokal, dan chart lazy-loaded. |
| `WEB_REFACTOR_NOTES.md` | Catatan batch refactor Next.js untuk public pages dan workspace admin besar seperti topics, NLP, scraper, users, dan admin detail. |
| `src/components/compare/` | Compare user. |
| `src/components/profile/` | Profile, favorite card, toolbar, dan compare tray. |
| `src/components/admin/` | Komponen dashboard admin per fitur. |
| `src/components/layout/` | Navbar, footer, admin sidebar, dan topbar. |
| `src/components/ui/` | Komponen UI dasar seperti button, input, dialog, select, table. |
| `src/services/admin/` | Data layer untuk request admin ke backend. |
| `src/lib/` | Axios client, helper image URL, kategori destinasi, dan validation schema. |
| `src/store/` | Zustand auth store. |
| `public/` | Asset public Next.js. |
| `gambar/` | Asset gambar lokal project. |
| `WEB_CODE_FLOW.md` | Dokumentasi flow source code web. |

## Flow Web

1. Browser membuka route Next.js.
2. Route server component mengambil data awal jika perlu.
3. Client component mengatur state interaktif.
4. Axios di `src/lib/axios.ts` memanggil backend.
5. Backend mengembalikan data.
6. Komponen menampilkan loading, error, atau data.

Contoh search:

1. User membuka `/search`.
2. `SearchClient` mengatur state dan `SearchCommandSurface` merender input, mode, dan prompt cepat.
3. Request dikirim ke `POST /api/search`.
4. Jika user login, riwayat pencarian dimuat dari `GET /api/search/history`.
5. `SearchFilterPanel` dan `SearchHistoryPanel` merender rail kiri agar container search tidak penuh JSX presentational.
6. Result ditampilkan dengan `SearchResultCard`.

Contoh login Google:

1. `src/components/providers.tsx` memasang `GoogleOAuthProvider` jika `NEXT_PUBLIC_GOOGLE_CLIENT_ID` tersedia.
2. User menekan tombol "Masuk / daftar dengan Google" pada `/login`.
3. Google mengembalikan credential `id_token`.
4. Web mengirim `POST /api/auth/google` ke backend.
5. Response token backend disimpan di `useAuthStore`, lalu user diarahkan ke `callbackUrl` atau profile.

Contoh admin destinasi:

1. Admin login.
2. Middleware mengecek cookie auth.
3. Route `/admin/destinations` membuka table admin.
4. `adminDestinationService` memanggil backend.
5. Admin bisa create, update, delete, upload thumbnail, dan upload gallery.

Catatan UI admin:

- Halaman admin dirapikan sebagai workspace operasional dinas pariwisata.
- Panel legenda besar tidak dirender di halaman utama jika informasi sudah jelas dari badge, label, icon, chart legend, atau tooltip.
- Prioritas tindakan seperti review negatif, data destinasi kurang lengkap, job gagal, dan topik perlu rename dibuat lebih menonjol daripada teks panduan panjang.
- Dropdown custom `NativeSelect` dirender sebagai portal sehingga opsi tidak terpotong oleh table overflow pada halaman admin.

Contoh admin scraper:

1. Admin membuka `/admin/scraper`.
2. `ScraperClient` memuat destinasi dan job scraping.
3. Admin bisa mencari tempat Maps, memilih hasil untuk mengisi URL, memilih batas ulasan atau mode seluruh ulasan, lalu memulai job.
4. Job monitor bisa membuka detail status job, melihat history scraping, dan mengunduh Excel. Chart scraper dipisah ke file chart khusus dan dimuat dynamic agar panel command/table tidak membawa `recharts` langsung.

Contoh admin NLP Processing:

1. Admin membuka `/admin/nlp-processing`.
2. Admin memilih destinasi dan file CSV/XLSX hasil scraping.
3. Web menjalankan preflight ke backend untuk menghitung review baru, duplikat, dan file yang pernah diproses.
4. Admin memilih mode `Lewati duplikat`, `Proses ulang`, atau `Ganti data`.
5. Backend memproses review target ke Model Python, menyimpan hasil NLP, dan mencatat history proses.
6. Panel riwayat menampilkan status, mode, jumlah review inserted/skipped/processed, admin, dan error jika gagal.
7. Preflight tidak membuat history run; riwayat baru muncul setelah admin menekan tombol proses.

Contoh admin topics:

1. Admin membuka `/admin/topics`.
2. `TopicsClient` memuat topic dan topic group.
3. Search admin topic memakai nama topic saja agar pencarian taxonomy lebih presisi.
4. Admin bisa rename topic, CRUD topic group, mengatur anggota topik dalam group, memindahkan topik dari group lain, mengatur visibility, melihat destinasi terkait topic, melihat ulasan berdasarkan topic, dan menggabungkan beberapa topic duplikat ke satu topic target.
5. Drawer ulasan topic menampilkan badge multi-aspect jika review masuk sebagai topik utama atau aspek tambahan.
6. Jika rename manual menghasilkan nama yang sudah ada, backend otomatis menggabungkan topic ke nama existing.
7. Dialog merge memiliki search target/source agar admin mudah mencari topic yang ingin digabung.

Contoh admin compare:

1. Admin membuka `/admin/compare` untuk membandingkan dua destinasi.
2. Halaman compare fokus pada selisih metrik, pemenang rekomendasi, topic overlap, dan sinyal trend terbaru.
3. Admin membuka `/admin/detail` untuk analitik detail satu destinasi.
4. Analitik detail menampilkan kualitas sinyal, risiko sentimen, gambaran situasi tempat, snapshot bulanan, pembicaraan utama, sinyal operasional, topik prioritas, checklist tindakan dinas, dan chart tren bulanan tiga sentimen dalam satu grafik garis. Chart analitik detail dipisah ke file chart khusus dan dimuat dynamic agar view utama tidak mengimpor `recharts` langsung.

## Auth dan Route Protection

File utama:

- `src/store/auth.store.ts`
- `src/proxy.ts`
- `src/app/(auth)/login/page.tsx`
- `src/components/layout/Navbar.tsx`

Alur:

1. Login mengirim email/password ke backend.
2. Backend mengembalikan user dan token.
3. Token/user disimpan di store dan cookie.
4. Proxy Next memakai cookie untuk proteksi route.
5. Admin route hanya boleh dibuka role admin.

## Menjalankan Bersama Backend

Terminal 1:

```powershell
cd "D:\Kuliah\Ta\New folder\backend"
npm run start:dev
```

Terminal 2:

```powershell
cd "D:\Kuliah\Ta\New folder\web"
npm run dev
```

Buka:

```txt
http://localhost:3001
```

## Validasi Setelah Clone

```powershell
cd "D:\Kuliah\Ta\New folder\web"
npm install
npm run lint
npm run build
npm run dev
```

Manual check:

- `/`
- `/search`
- `/destinations/[slug]`
- `/compare`
- `/login`
- `/profile`
- `/favorites`
- `/admin`
- `/admin/destinations`
- `/admin/reviews`
- `/admin/topics`
- `/admin/compare`
- `/admin/detail`
- `/admin/nlp-processing`
- `/admin/scraper`
- `/admin/users`

## Troubleshooting

### Semua route 404

Periksa:

- route file masih ada di `src/app`;
- `proxy.ts` tidak salah redirect;
- Next dev server dijalankan dari folder `web`;
- cache `.next` tidak korup. Jika route file ada tetapi route seperti `/profile`, `/favorites`, `/routes/saved`, atau `/admin/topics` tetap 404, hentikan dev server lalu jalankan ulang `npm run dev`. Script `dev` dan `build` otomatis menjalankan `scripts/clean-next-route-cache.mjs` untuk menghapus `.next/dev` dan `.next/types` sebelum Next membuat route manifest baru.
- Jangan menjalankan dev server lama sambil memakai cache generated yang sudah korup. Gejalanya terlihat dari `.next/dev/types/routes.d.ts` atau `.next/types/routes.d.ts` yang tidak memuat semua route App Router.

### Backend tidak terhubung

Periksa:

- backend hidup di port 3000;
- `NEXT_PUBLIC_API_URL` benar;
- CORS backend memasukkan origin web;
- browser console tidak menunjukkan network error.

### Hydration warning `bis_skin_checked`

Biasanya dari ekstensi browser. Coba disable extension atau buka incognito.

### Chart width/height warning

Pastikan container chart punya tinggi/width stabil dan tidak dirender saat hidden dengan ukuran `-1`.
# Catatan Tampilan

Landing web menggunakan fotografi wisata sebagai fondasi visual. Hero utama tetap berdiri sendiri, sedangkan rekomendasi di bawahnya menggunakan editorial destination rail tanpa autoplay. Interaksi rutin dibatasi di bawah 300 ms, hover lift dikurangi, dan bentuk pill hanya dipakai untuk badge atau status.
