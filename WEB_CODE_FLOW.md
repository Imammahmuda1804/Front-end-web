# Dokumentasi Flow Kode Web RANAHINSIGHT

Dokumen ini menjelaskan struktur folder `web`, alur kerja kode, dan fungsi komentar Bahasa Indonesia yang ditambahkan pada bagian core frontend. Target pembaca adalah orang yang belum terbiasa memakai Next.js App Router, React Client Component, React Query, Axios, atau pola dashboard admin.

## Peran Folder Web

Folder `web` adalah frontend Next.js untuk pengguna umum dan admin. Tugas utamanya:

1. menampilkan landing page, katalog destinasi, search, detail destinasi, route wisata, compare, profile, dan favorite;
2. menyediakan dashboard admin untuk destinasi, review, topik, scraper, NLP, user, dan analytics;
3. memanggil backend NestJS melalui Axios dan service layer;
4. mengelola state login di browser melalui `useAuthStore`;
5. menampilkan data NLP seperti skor AI, sentimen, topik, topic group, dan chart.

Web tidak menyimpan data permanen sendiri. Semua data utama tetap berasal dari backend.

## Struktur Folder Utama

### `web/src/app`

Posisi pada flow: route tree Next.js App Router.

Kegunaan:
- mendefinisikan halaman public, auth, profile, admin, search, compare, dan detail destinasi;
- menjalankan server fetch untuk halaman yang bisa dirender di server;
- menyediakan metadata halaman;
- menyediakan route API internal seperti revalidate cache.

File penting:
- `layout.tsx`: root layout aplikasi.
- `(public)/page.tsx`: landing page public.
- `(public)/destinations/page.tsx`: katalog semua destinasi publik.
- `(public)/search/page.tsx`: halaman search.
- `(public)/destinations/[slug]/page.tsx`: halaman detail destinasi berbasis slug.
- `(public)/routes/page.tsx`: katalog route publik dan rekomendasi route.
- `(auth)/login/page.tsx` dan `(auth)/register/page.tsx`: halaman autentikasi.
- `admin/*/page.tsx`: entrypoint halaman admin.
- `api/revalidate/route.ts`: endpoint internal untuk revalidasi cache.

Komentar penting:
- `Revalidasi halaman setiap 60 detik`: menandai halaman public yang memakai ISR ringan.

### `web/src/lib`

Posisi pada flow: helper global frontend.

File penting:
- `axios.ts`: instance Axios dan refresh token flow.
- `utils.ts`: helper className dan URL gambar.
- `destination-categories.ts`: daftar kategori destinasi yang dipakai filter dan form.
- `validations/destination.ts`: schema validasi form destinasi.

Komentar penting:
- `API_BASE_URL`: memilih URL backend dari env atau fallback localhost.
- `api`: instance Axios yang dipakai semua service.
- `processQueue`: menyelesaikan request yang menunggu saat refresh token sedang berjalan.
- interceptor request: memasang access token ke header.
- interceptor response: menangani 401, refresh token, update auth store, dan redirect login.

Alur request API:
1. Komponen atau service memanggil `api`.
2. Request interceptor mengambil access token dari `useAuthStore`.
3. Jika backend mengembalikan 401, response interceptor mencoba refresh token.
4. Request yang gagal saat refresh sedang berjalan masuk ke queue.
5. Setelah token baru tersedia, queue dilanjutkan dan request awal diulang.

### `web/src/store`

Posisi pada flow: state auth browser.

Kegunaan:
- menyimpan user, access token, refresh token, dan status login;
- dipakai oleh navbar, admin topbar, halaman profile, login Google, dan Axios interceptor.

Catatan:
- State ini berjalan di client/browser.
- Untuk protected route, `proxy.ts` juga membaca cookie/token yang relevan.

### `web/src/components/layout`

Posisi pada flow: struktur navigasi global.

File penting:
- `Navbar.tsx`: navbar public.
- `AdminTopbar.tsx`: topbar admin untuk profil, logout, dan drawer mobile.
- `Footer.tsx`: footer public.

Catatan tampilan:
- Navbar public memakai surface semi transparan dengan blur ringan, border putih halus, dan radius `rounded-xl` agar modern tetapi tidak terlalu kapsul.
- Public layout memakai background foto wisata Sumatera Barat dari `public/images/sumbar-tourism-bg.jpg` dengan overlay CSS tipis. Foto berfungsi sebagai atmosfer halaman, sedangkan section utama tetap memakai surface putih/warm agar teks mudah dibaca.
- Radius besar di halaman user dikurangi: panel utama memakai `rounded-xl`, control memakai `rounded-lg`, sedangkan `rounded-full` dipertahankan hanya untuk avatar, dot status, progress bar, atau chip kecil.

Komentar penting:
- `mobileAdminLinks`: daftar menu drawer admin mobile.
- `AdminTopbar`: menjelaskan topbar admin sebagai penghubung navigasi mobile, profil, dan logout.

## Flow Public User

### Landing Page

Folder/file:
- `web/src/app/(public)/page.tsx`
- `web/src/components/home/HeroSection.tsx`
- `web/src/components/home/InfoSection.tsx`
- `web/src/components/home/BentoGrid.tsx`

Kegunaan:
- memberi entrypoint brand RANAHINSIGHT;
- menampilkan CTA search;
- menampilkan timecard slider destinasi rekomendasi di dalam hero;
- menjelaskan sinyal AI, sentimen, dan topik secara visual.

Alur:
1. Page public mengambil data rekomendasi dari backend.
2. Data diteruskan ke `HeroSection`.
3. `HeroSection` memakai GSAP untuk animasi opening, preview card, progress slide, dan kontrol manual.
4. CTA search mengarahkan user ke `/search?q=...`.

### Search

Folder/file:
- `web/src/app/(public)/search/page.tsx`
- `web/src/components/search/SearchClient.tsx`
- `web/src/components/search/SearchResultCard.tsx`
- `web/src/components/search/SearchClientBoundary.tsx`

Kegunaan:
- mencari destinasi dengan keyword atau semantic search;
- memfilter kota dan kategori;
- menampilkan top 3 topik sempit pada kartu hasil;
- menyimpan history search jika user login.

Komentar penting:
- `quickPrompts`: prompt cepat untuk mode semantic.
- `SearchClient`: mengatur query, filter, mode, history, loading, dan hasil.
- `executeSearch`: memilih endpoint search, keyword atau semantic.

Alur keyword search:
1. User mengisi input atau filter.
2. `SearchClient` membuat query param.
3. Frontend memanggil `/api/destinations`.
4. Result ditampilkan oleh `SearchResultCard`.

Alur semantic search:
1. User memilih mode `Semantik`.
2. `SearchClient` POST ke `/api/search`.
3. Backend membuat embedding query dan menjalankan pgvector search.
4. Result dikirim ke frontend lengkap dengan score dan top topic.

### Katalog Destinasi

Folder/file:
- `web/src/app/(public)/destinations/page.tsx`
- `web/src/components/destinations/DestinationCatalogCard.tsx`
- `web/src/components/layout/Navbar.tsx`

Kegunaan:
- menampilkan seluruh destinasi publik dari endpoint `/api/destinations`;
- memberi akses cepat ke search/filter dan katalog route;
- membuka detail destinasi melalui card katalog yang lebih visual.
- menjaga tinggi card stabil dengan deskripsi terbatas, topik ringkas, dan CTA sejajar.
- memakai `SearchResultCardStatic` agar katalog server-rendered tidak membawa animasi client card.

Alur:
1. Page `/destinations` mengambil daftar destinasi dari backend dengan revalidate ringan.
2. Data dirender sebagai grid card memakai `DestinationCatalogCard`.
3. `DestinationCatalogCard` menampilkan gambar, kategori, kota, metric, topik pendek, dan CTA.
4. Navbar menyediakan link `Destinasi`, `Eksplorasi`, `Rute`, dan `Bandingkan`.

### Route Wisata

Folder/file:
- `web/src/app/(public)/routes/page.tsx`
- `web/src/app/(public)/routes/me/page.tsx`
- `web/src/app/(public)/routes/saved/page.tsx`
- `web/src/app/(public)/routes/new/page.tsx`
- `web/src/app/(public)/routes/[shareSlug]/page.tsx`
- `web/src/components/routes/RoutesClient.tsx`
- `web/src/components/routes/SavedRoutesClient.tsx`

Kegunaan:
- menampilkan semua route publik dan rekomendasi route;
- menampilkan route milik user;
- mengedit route milik user dari `/routes/me`;
- menampilkan route tersimpan dan progress kunjungan user;
- membuat route baru dan membuka detail route shareable.

Alur rute tersimpan:
1. User membuka `/routes/saved`.
2. `SavedRoutesClient` mengambil route tersimpan dan progress stop dari backend.
3. User menandai stop sebagai sudah dikunjungi atau meresetnya.
4. Frontend refresh progress route dan menampilkan tujuan berikutnya.
5. Jika action gagal karena tabel progress belum ada, jalankan migration backend terbaru agar model `SavedRouteProgress` tersedia di database.
6. Pada `/routes/me`, tombol `Edit rute` membuka `RouteBuilderClient` dengan data route existing lalu mengirim `PUT /api/routes/:id`.

Alur detail route:
1. User membuka `/routes/[shareSlug]`.
2. `RouteDetailClient` mengambil route public/link-only dari backend.
3. Jika user login, frontend memeriksa `/api/routes/saved` untuk menampilkan status tersimpan.
4. User bisa menyimpan route atau menghapus simpanan.
5. Fitur salinan route tidak ditampilkan di UI karena action simpan sudah cukup untuk kebutuhan user.

### Detail Destinasi

Folder/file:
- `web/src/app/(public)/destinations/[slug]/page.tsx`
- `web/src/components/destinations/DestinationDetailClient.tsx`
- `web/src/components/destinations/DestinationGallerySection.tsx`
- `web/src/components/destinations/TopicInsightSection.tsx`
- `web/src/components/destinations/DestinationTopicSentimentChart.tsx`
- `web/src/components/destinations/ReviewFormSection.tsx`

Kegunaan:
- menampilkan hero destinasi, deskripsi, Maps, YouTube, galeri, metrik AI, chart, topik, dan review;
- mengelola favorite user;
- menampilkan ulasan berdasarkan topik atau topic group.

Komentar penting:
- `getYouTubeEmbedUrl`: mengubah URL YouTube menjadi embed URL.
- `cleanTopicName`: membersihkan label topik teknis dari model.
- `DestinationDetailClient`: menyatukan detail destinasi, favorite, gallery, chart, topic insight, dan review.

Alur:
1. Server page mengambil destinasi berdasarkan slug.
2. Data awal dikirim ke `DestinationDetailClient`.
3. Client mengecek favorite jika user login.
4. Section vibe menampilkan cloud topik detail dalam tiga arah sentimen: positif, netral/campuran, dan negatif. Kartu topic group utama dipisahkan di bawahnya dan bisa diklik untuk membaca contoh ulasan.
5. User bisa membuka galeri, menambah favorite, membaca topik, atau mengirim review.

### Compare Public

Folder/file:
- `web/src/app/(public)/compare/page.tsx`
- `web/src/components/compare/CompareClient.tsx`
- `web/src/components/compare/DestinationSelect.tsx`
- `web/src/components/compare/CompareCharts.tsx`
- `web/src/components/compare/compare-components.tsx`

Kegunaan:
- memilih dua destinasi;
- membandingkan skor AI, rating, sentimen, dan topik;
- menjaga pilihan destinasi di URL query param.

Komentar penting:
- `normalizeScore`: mengubah skor backend 0-1 menjadi 0-100.
- `topicChips`: mengambil ringkasan topik dominan untuk kartu compare.
- `CompareClient`: mengatur pilihan destinasi dan fetch hasil compare.

Alur:
1. User memilih destinasi A dan B.
2. `CompareClient` menyimpan pilihan ke URL.
3. React Query memanggil `/api/analytics/compare`.
4. Result card dan chart menampilkan perbandingan.

### Profile dan Favorite

Folder/file:
- `web/src/app/profile/page.tsx`
- `web/src/app/favorites/page.tsx`
- `web/src/components/profile/ProfileClient.tsx`
- `web/src/components/profile/profile-components.tsx`

Kegunaan:
- melihat dan mengubah profil;
- melihat favorite;
- filter favorite berdasarkan kota, nama, dan sort;
- memilih destinasi favorit untuk compare tray.

Komentar penting:
- `getErrorMessage`: mengambil pesan error API dengan fallback.
- `derivePersonas`: menghitung persona perjalanan dari topik favorite.
- `deriveStats`: menghitung kota dominan, rata-rata skor, dan rating.
- `ProfileClient`: mengelola profile, favorite, compare tray, dan undo remove.

Alur:
1. `ProfileClient` membaca user dari auth store.
2. Jika login, frontend memanggil `/api/favorites`.
3. Favorite diolah menjadi stats, persona, dan list.
4. User bisa update profile, remove favorite, atau compare favorite.

## Flow Admin

### Admin Dashboard

Folder/file:
- `web/src/app/admin/page.tsx`
- `web/src/components/admin/dashboard/AdminDashboardClient.tsx`
- `web/src/components/admin/dashboard/*`
- `web/src/services/admin/analytics.service.ts`

Kegunaan:
- menampilkan ringkasan data admin;
- menampilkan tren, aktivitas, review mix, top destinasi, top topik, dan risk matrix.

Komentar penting:
- `AdminDashboardClient`: mengambil data dashboard dan menyusun panel analytics.
- `AdminAnalyticsService`: memanggil endpoint dashboard dan analytics backend.
- `unwrapApiData`: membuka response yang bisa terbungkus interceptor backend.

Alur:
1. Dashboard client memanggil service analytics.
2. Service memanggil endpoint backend admin/public analytics.
3. Komponen chart dan card menampilkan data.

### Admin Destinations

Folder/file:
- `web/src/app/admin/destinations/page.tsx`
- `web/src/components/admin/destinations/destinations-table.tsx`
- `web/src/components/admin/destinations/destination-form-modal.tsx`
- `web/src/components/admin/destinations/thumbnail-uploader.tsx`
- `web/src/components/admin/destinations/gallery-uploader.tsx`
- `web/src/services/admin/destination.service.ts`

Kegunaan:
- list, filter, create, update, soft delete destinasi;
- upload thumbnail dan galeri;
- validasi kategori destinasi;
- membuka preview drawer destinasi.

Komentar penting:
- `DestinationsTable`: mengelola tabel destinasi admin, filter, CRUD, dan upload media.
- `adminDestinationService`: service API untuk CRUD dan upload media.
- `getHttpStatus`: membaca status HTTP dari error upload/API.

Alur:
1. Page admin membaca filter awal dari URL.
2. `DestinationsTable` mengambil data dengan React Query.
3. Form modal mengirim create/update ke service.
4. Jika ada file, service mengirim multipart upload ke backend.

### Admin Reviews

Folder/file:
- `web/src/app/admin/reviews/page.tsx`
- `web/src/components/admin/reviews/AdminReviewsClient.tsx`
- `web/src/components/admin/reviews/ReviewsTable.tsx`
- `web/src/components/admin/reviews/DestinationAnalytics.tsx`
- `web/src/services/admin/reviews.service.ts`

Kegunaan:
- memilih destinasi untuk manajemen review;
- melihat tabel review dan analytics;
- filter review berdasarkan rating, sentimen, source, topik, dan confidence;
- bulk delete/export.

Komentar penting:
- `AdminReviewsClient`: mengatur tab dan sinkronisasi filter ke URL.
- `ReviewsTable`: mengelola data table, preview, bulk action, dan export.
- `adminReviewsService`: service API review admin.

Alur:
1. Admin memilih destinasi.
2. URL menyimpan `destinationId` dan tab aktif.
3. `ReviewsTable` memanggil backend dengan filter.
4. Admin bisa preview, delete, export, atau melihat analytics.

### Admin Topics

Folder/file:
- `web/src/app/admin/topics/page.tsx`
- `web/src/components/admin/topics/TopicsClient.tsx`
- `web/src/components/admin/topics/topics-client.*.tsx`
- `web/src/components/admin/topics/topics-client.*.ts`
- `web/src/services/admin/topic.service.ts`

Kegunaan:
- melihat taxonomy topik;
- rename topic manual;
- menjalankan AI naming;
- mengatur topic group dan visibility search/detail;
- mencari topic berdasarkan nama topic;
- melihat ulasan berdasarkan topic dari drawer admin;
- menggabungkan beberapa topic duplikat ke satu topic target;
- membuat, memperbarui, dan menghapus topic group luas;
- mengatur topik detail yang masuk ke topic group lewat panel CRUD group, termasuk memindahkan topik dari group lain;
- membaca metrik naming debt dan coverage.

Komentar penting:
- `isUnnamed`: mendeteksi topic yang masih memakai nama fallback.
- `TopicsClient`: mengelola taxonomy topic, group, rename, merge, visibility, dan AI naming.
- `AdminTopicService`: service API manajemen topic, topic group, destinasi topic, dan merge topic.

Alur:
1. `TopicsClient` mengambil topics dan topic groups.
2. Data dihitung menjadi metrics, chart, table, dan queue action.
3. Search di command panel memfilter berdasarkan nama topic saja.
4. Admin bisa membuka merge dari toolbar atau dari baris topic.
5. Dialog merge menyediakan search untuk target dan source agar topic cepat ditemukan.
6. Panel topic group bisa membuat/edit/hapus group dan mencentang topik detail yang masuk ke group tersebut; topik dari group lain akan dipindahkan ke group aktif.
7. Admin membuka drawer ulasan topic; data diambil lazy dari `GET /api/admin/topics/:id/reviews` dengan filter sentimen.
8. Dropdown group memakai portal agar opsi tidak terpotong oleh table overflow.
9. Admin bisa rename, merge, delete, update settings, CRUD topic group, atau menjalankan AI naming.
10. Dialog merge memilih satu topic target dan beberapa topic source; backend memindahkan review/relasi source ke target.

### Admin Bandingkan dan Analitik Detail

Folder/file:
- `web/src/app/admin/compare/page.tsx`
- `web/src/app/admin/detail/page.tsx`
- `web/src/app/admin/detail/loading.tsx`
- `web/src/components/admin/compare/CompareClient.tsx`
- `web/src/components/admin/compare/AdminSingleAnalysisClient.tsx`
- `web/src/components/admin/compare/admin-compare.*.tsx`

Kegunaan:
- `/admin/compare` membandingkan dua destinasi, termasuk trend decision signal.
- `/admin/detail` membaca satu destinasi secara detail untuk stakeholder dinas, termasuk gambaran situasi tempat dan sinyal operasional.

Alur:
1. App Router menampilkan `admin/detail/loading.tsx` saat segmen detail sedang dimuat.
2. Admin memilih destinasi dari `NativeSelect`.
3. Client memanggil analytics destination, trends, topics, atau compare sesuai halaman.
4. `SingleAnalysisView` menampilkan signal health, sentiment risk, gambaran situasi tempat, snapshot bulanan, pembicaraan utama, sinyal operasional, topic priority, action checklist, dan chart.
5. Chart detail admin berada di `admin-compare.single.charts.tsx` dan dimuat dynamic agar `recharts` tidak dibawa langsung oleh view utama.
6. Helper derivasi situasi dan sinyal operasional berada di `admin-compare.single.utils.ts` agar `SingleAnalysisView` fokus pada render.
7. UI lokal seperti `ChartCard`, `MetricCard`, dan empty state berada di `admin-compare.single.ui.tsx`.
8. Helper format dan agregasi compare bertahap dipindahkan ke `admin-compare.utils.ts` agar container compare tidak menjadi sumber semua util.
9. Type shared compare seperti `Tone`, `DestinationOption`, dan `MetricRow` berada di `admin-compare.types.ts`.
10. Chart tren sentimen bulanan memakai satu `LineChart` dengan garis positif, netral, dan negatif agar admin bisa melihat persilangan arah sentimen antar periode.
11. `CompareAnalysisView` menampilkan pemenang, delta metrik, trend terbaru, radar, sentimen, topic overlap, dan variance table.

### Admin Scraper

Folder/file:
- `web/src/app/admin/scraper/page.tsx`
- `web/src/components/admin/scraper/ScraperClient.tsx`
- `web/src/components/admin/scraper/scraper-components.tsx`
- `web/src/services/admin/scraper.service.ts`

Kegunaan:
- memilih destinasi;
- memulai scraping Google Maps review;
- memilih batas review atau mode ambil seluruh ulasan;
- polling status job;
- menampilkan health chart dan yield chart;
- download Excel hasil scraping.

Komentar penting:
- `ScraperClient`: mengelola job scraping, polling, chart, dan download.
- `AdminScraperService`: service API Maps search, scraping job, history, dan download.
- Chart scraper berada di `scraper-charts.tsx` dan dimuat dynamic dari `scraper-components.tsx` agar `recharts` tidak masuk ke command/table utama.

Alur:
1. Admin memilih destinasi dan jumlah review, atau mengaktifkan mode `Ambil seluruh ulasan berteks`.
2. `ScraperClient` memanggil `startScraping`.
3. Job masuk queue backend.
4. Client polling status aktif.
5. Jika selesai, admin bisa download Excel.

### Admin NLP Processing

Folder/file:
- `web/src/app/admin/nlp-processing/page.tsx`
- `web/src/components/admin/nlp/NlpProcessingClient.tsx`
- `web/src/components/admin/nlp/nlp-processing.panels.tsx`
- `web/src/components/admin/nlp/nlp-processing.result.tsx`
- `web/src/components/admin/nlp/nlp-processing.utils.ts`
- `web/src/services/admin/nlp.service.ts`

Kegunaan:
- upload file review manual;
- memilih destination ID;
- menjalankan preflight file agar admin melihat review baru dan duplikat sebelum proses;
- memilih mode proses aman untuk mencegah duplikasi review;
- mengirim file ke backend agar diproses NLP;
- menampilkan hasil ringkas dan riwayat proses NLP.

Komentar penting:
- `NlpProcessingClient`: mengelola upload file review, preflight dedup, mode proses, history, dan proses NLP manual.
- `AdminNlpService`: service API preflight, upload file, dan history NLP.

Alur:
1. Admin memilih destinasi dan file.
2. Client validasi file di browser lalu memanggil `preflight`.
3. UI menampilkan total baris, review baru, duplikat, dan saran mode.
4. Admin memilih mode `skip_existing`, `reprocess_existing`, atau `replace_existing`.
5. Service mengirim multipart form ke backend.
6. Backend memanggil service Python Model hanya untuk review target.
7. Result ringkas dan history run ditampilkan di UI.
8. Preflight hanya membaca file dan menghitung duplikat; history run baru dibuat setelah upload/process dijalankan.

### Admin Users

Folder/file:
- `web/src/app/admin/users/page.tsx`
- `web/src/components/admin/users/UsersClient.tsx`
- `web/src/components/admin/users/UserFormModal.tsx`
- `web/src/components/admin/users/UserDetailModal.tsx`
- `web/src/services/admin/user.service.ts`

Kegunaan:
- melihat daftar user;
- membuat user;
- mengubah profile, role, dan status;
- suspend/activate/delete user;
- melihat detail user.

Komentar penting:
- `UsersClient`: mengelola daftar user, filter, create, edit, suspend, dan delete.
- `AdminUserService`: service API manajemen user admin.

Alur:
1. `UsersClient` mengambil list user.
2. Admin menjalankan action dari tabel atau modal.
3. Service mengirim mutation ke backend.
4. Query di-refresh agar UI sinkron.

## Service Layer

Folder: `web/src/services/admin`

Peran:
- memusatkan pemanggilan API admin;
- menjaga komponen UI tidak berisi detail endpoint;
- menormalisasi response backend yang kadang terbungkus `data`.

File penting:
- `analytics.service.ts`: dashboard dan analytics destinasi.
- `destination.service.ts`: CRUD destinasi dan upload media.
- `reviews.service.ts`: review admin dan bulk action.
- `scraper.service.ts`: Maps search, job scraping, history, download.
- `nlp.service.ts`: preflight file NLP, upload dengan mode dedup, dan history proses.
- `topic.service.ts`: topic, group, rename, visibility, destinasi topic, dan ulasan topic admin.
- `user.service.ts`: user admin.

## Pola Data dan Komponen

### Server Component

Digunakan pada:
- route page yang hanya mengambil data awal;
- metadata;
- halaman detail destinasi berbasis slug.

Tujuan:
- mengurangi bundle client;
- membuat data awal tersedia sebelum hidrasi.

### Client Component

Digunakan pada:
- form;
- search;
- compare;
- profile;
- admin workspace;
- chart dan komponen yang memakai event browser.

Alasan:
- perlu state lokal;
- perlu React Query;
- perlu handler klik/input;
- perlu akses browser API seperti `URL.createObjectURL`, localStorage, dan router client.

### React Query

Dipakai di:
- dashboard admin;
- destinasi admin;
- review admin;
- topic admin;
- scraper;
- compare.

Tujuan:
- caching request;
- loading/error state;
- refetch setelah mutation.

### Dynamic Import

Dipakai untuk:
- chart Recharts;
- panel visual berat.

Tujuan:
- menunda bundle chart sampai diperlukan;
- mengurangi beban initial page.

## Hubungan Web dengan Backend dan Model

1. Web tidak memanggil Python Model langsung.
2. Web memanggil backend NestJS melalui `api` Axios.
3. Backend memanggil Model untuk NLP, embedding, dan topic.
4. Backend menyimpan hasil ke database.
5. Web membaca hasil akhir dari backend.

Contoh:
- Search semantic: `SearchClient` -> `/api/search` -> backend -> Model embed -> pgvector -> result.
- NLP upload: `NlpProcessingClient` -> preflight dedup backend -> mode proses -> Model pipeline -> database -> summary dan history.
- Detail destinasi: page detail -> backend destination detail -> topic group/sentiment/review -> UI.

## Aturan Komentar Web

Komentar yang dipertahankan atau ditambahkan harus:
- berbahasa Indonesia;
- ringkas;
- menjelaskan fungsi atau posisi flow;
- tidak mengulang nama function secara mentah;
- tidak memakai blok JSDoc panjang kecuali benar-benar diperlukan untuk public API internal.

Komentar yang dihindari:
- komentar step visual seperti `STEP 1`, `Email Field`, `Overlay Logo`;
- komentar yang hanya menerjemahkan baris kode;
- komentar dekoratif panjang;
- komentar berbahasa Inggris campur Indonesia tanpa kebutuhan.

## Cara Membaca Flow untuk Developer Baru

Urutan belajar yang disarankan:

1. Baca `src/app/layout.tsx` untuk memahami root layout.
2. Baca `src/lib/axios.ts` untuk memahami koneksi ke backend.
3. Baca `src/store/auth.store.ts` untuk memahami login state.
4. Baca `src/components/search/SearchClient.tsx` untuk flow user paling penting.
5. Baca `src/components/destinations/DestinationDetailClient.tsx` untuk flow detail destinasi.
6. Baca `src/components/admin/destinations/destinations-table.tsx` untuk pola admin CRUD.
7. Baca `src/services/admin/*.service.ts` untuk pola pemanggilan API admin.

Dengan urutan ini, developer baru bisa memahami dari route, state, service API, sampai komponen UI interaktif.

## Indeks File Berpengaruh dan Referensi Baris

Bagian ini memetakan file web yang memengaruhi flow route, state, pemanggilan API, tampilan publik, tampilan admin, dan komponen reusable. Referensi baris menunjuk fungsi atau komponen utama yang sebaiknya dibaca lebih dulu.

### App Router, Layout, Auth, dan API Client

| Path | Posisi pada flow | Kegunaan | Referensi baris utama |
| --- | --- | --- | --- |
| `web/src/app/layout.tsx` | Root layout | Memasang metadata, provider, font, dan patch kecil untuk mengurangi hydration mismatch dari ekstensi browser. | `metadata` `layout.tsx:7`, `RootLayout` `layout.tsx:12` |
| `web/src/app/(public)/layout.tsx` | Layout public | Membungkus halaman publik dengan navbar dan footer. | `PublicLayout` `layout.tsx:4` |
| `web/src/proxy.ts` | Route protection | Mengarahkan user berdasarkan cookie auth untuk route public/private/admin memakai convention Proxy Next.js 16. | `proxy` `proxy.ts:9`, `config` `proxy.ts:60` |
| `web/scripts/clean-next-route-cache.mjs` | Build guard | Menghapus generated `.next/dev` dan `.next/types` sebelum dev/build agar route manifest/type yang korup tidak membuat route 404 atau typecheck gagal. | script dijalankan dari `package.json` `dev` dan `build` |
| `web/src/components/providers.tsx` | Provider client | Menyediakan React Query dan provider global untuk komponen client. | `Providers` `providers.tsx:17` |
| `web/src/lib/axios.ts` | API client | Membuat instance Axios ke backend dan menjadi jalur utama request frontend. | `API_BASE_URL` `axios.ts:5`, `api` `axios.ts:11` |
| `web/src/store/auth.store.ts` | State auth | Menyimpan state login, user, token, cookie auth, dan action logout/login. | `writeAuthCookie` `auth.store.ts:28`, `useAuthStore` `auth.store.ts:42` |
| `web/src/lib/utils.ts` | Utility UI | Menyediakan `cn` dan helper URL gambar untuk komponen visual. | `cn` `utils.ts:4`, `getImageUrl` `utils.ts:8` |
| `web/src/lib/destination-categories.ts` | Kategori destinasi | Menyamakan label kategori destinasi antara form admin, search, dan card hasil. | `DESTINATION_CATEGORIES` `destination-categories.ts:1`, `getDestinationCategoryLabel` `destination-categories.ts:16` |
| `web/src/lib/validations/destination.ts` | Validasi form | Schema Zod untuk form create/update destinasi admin. | `destinationSchema` `destination.ts:6` |

### Route Publik dan Tampilan User

| Path | Posisi pada flow | Kegunaan | Referensi baris utama |
| --- | --- | --- | --- |
| `web/src/app/(public)/page.tsx` | Landing page | Server Component yang mengambil rekomendasi awal lalu merender home sections. | `getRecommendations` `page.tsx:13`, `Home` `page.tsx:32` |
| `web/src/components/home/HeroSection.tsx` | Tampilan home | Hero rekomendasi destinasi dengan background aktif, preview card, progress, deskripsi, CTA detail, dan metric sentimen. | `HeroSection` `HeroSection.tsx:80` |
| `web/src/components/home/InfoSection.tsx` | Edukasi produk | Menjelaskan cara platform membaca ulasan dan insight wisata. | `InfoSection` `InfoSection.tsx:33` |
| `web/src/components/home/BentoGrid.tsx` | Landing feature grid | Menampilkan shortcut fitur dan value utama dalam bento layout. | `BentoGrid` `BentoGrid.tsx:39` |
| `web/src/app/(public)/search/page.tsx` | Route search | Merender halaman pencarian dan membiarkan state interaktif di `SearchClient`. | Route page untuk `/search` |
| `web/src/components/search/SearchClient.tsx` | Search workspace | Mengatur query, mode keyword/semantic, filter kota/kategori, loading, error, dan hasil. | `SearchClient` `SearchClient.tsx:69` |
| `web/src/components/search/SearchCommandSurface.tsx` | Command surface search | Memisahkan header, mode toggle, input utama, prompt cepat, dan info mode dari container search. | `SearchCommandSurface` |
| `web/src/components/search/SearchResultCard.tsx` | Card hasil search | Menampilkan thumbnail, kategori, top topic, rating, score, dan CTA detail. | `getDestinationMatch` `SearchResultCard.tsx:52`, `SearchResultCard` `SearchResultCard.tsx:71` |
| `web/src/components/search/SearchResultCardStatic.tsx` | Card hasil statis | Varian server-compatible tanpa `framer-motion` untuk migrasi bertahap ke card yang lebih ringan. | `SearchResultCardStatic` |
| `web/src/components/search/SearchFilterPanel.tsx` | Panel filter search | Memisahkan filter kota/kategori dan reset filter dari container `SearchClient`. | `SearchFilterPanel` |
| `web/src/components/search/SearchHistoryPanel.tsx` | Panel history search | Memisahkan daftar riwayat, hapus satu item, dan bersihkan semua history dari container `SearchClient`. | `SearchHistoryPanel` |
| `web/src/components/search/SearchResultSummary.tsx` | Summary hasil search | Memisahkan headline hasil, sort semantic, dan chip filter aktif dari container `SearchClient`. | `SearchResultSummary` |
| `web/src/components/search/SearchEmptyState.tsx` | State kosong search | Empty/error state reusable untuk mengurangi JSX di `SearchClient`. | `SearchEmptyState` |
| `web/src/components/search/SearchLoadingGrid.tsx` | Skeleton search | Loading skeleton reusable untuk result grid search. | `SearchLoadingGrid` |
| `web/src/components/search/search.utils.ts` | Helper search | Menyimpan helper hydration, validasi mode/sort, motion variant, dan normalisasi kategori. | Helper murni search |
| `web/src/components/search/search.types.ts` | Type search | Menyimpan type lokal search agar container tidak penuh definisi DTO UI. | Type lokal search |
| `web/src/components/search/search.api.ts` | API helper search | Membungkus request kota, kategori, history, dan penghapusan history agar `SearchClient` tidak memegang detail endpoint kecil. | API helper lokal search |
| `web/src/app/(public)/destinations/[slug]/page.tsx` | Route detail | Server Component yang fetch detail destinasi berdasarkan slug. | `generateMetadata` `page.tsx:13`, `getDestination` `page.tsx:36`, `DestinationPage` `page.tsx:50` |
| `web/src/components/destinations/DestinationDetailClient.tsx` | Detail interaktif | Mengatur favorite, review refresh, active section, galeri, nearby fetch, dan komposisi halaman detail. | `DestinationDetailClient` |
| `web/src/components/destinations/DestinationHeroSection.tsx` | Hero detail destinasi | Menampilkan image utama, ringkasan lokasi, metric AI/sentimen/rating, dan CTA maps/trailer. | `DestinationHeroSection` |
| `web/src/components/destinations/DestinationDetailNav.tsx` | Navigasi detail destinasi | Memisahkan tombol kembali/favorit dan anchor nav section dari container detail. | `DestinationTopActions`, `DestinationAnchorNav` |
| `web/src/components/destinations/DestinationNearbyList.tsx` | Destinasi terdekat | Menampilkan daftar destinasi sekitar berdasarkan koordinat dan jarak Haversine. | `DestinationNearbyList` |
| `web/src/components/destinations/detail.types.ts` | Type detail destinasi | Menyimpan DTO lokal detail destinasi, topik, review, nearby, dan chart row. | Type lokal detail |
| `web/src/components/destinations/detail.utils.ts` | Helper detail destinasi | Menyimpan parser YouTube, formatter rating/score/persen, pembersih nama topik, dan kalkulasi jarak. | Helper murni detail |
| `web/src/components/destinations/detail.ui.tsx` | UI presentational detail | Menyimpan section header, metric card, info tile, insight pill, dan review card agar container lebih kecil. | Komponen UI detail |
| `web/src/components/destinations/DestinationGallerySection.tsx` | Galeri detail | Menampilkan foto destinasi dengan preview dan layout galeri. | `DestinationGallerySection` `DestinationGallerySection.tsx:16` |
| `web/src/components/destinations/TopicInsightSection.tsx` | Peta topik detail | Menampilkan topic group/fine topic, sentiment, dan ulasan terkait topik. | `TopicInsightSection` `TopicInsightSection.tsx:117` |
| `web/src/components/destinations/topic-insight.types.ts` | Type peta topik | Menyimpan type topik, topic group, sentiment breakdown, fine topic, dan review topik. | Type lokal topic insight |
| `web/src/components/destinations/topic-insight.utils.ts` | Helper peta topik | Menyimpan kalkulasi bucket/crowd sentimen, warna sentimen, normalisasi nama topik, dan API base. | Helper murni topic insight |
| `web/src/components/destinations/ReviewFormSection.tsx` | Form review user | Mengirim ulasan user aplikasi dan menampilkan validasi/login gate. | `ReviewFormSection` `ReviewFormSection.tsx:30` |
| `web/src/components/destinations/DestinationTopicSentimentChart.tsx` | Chart detail | Menampilkan distribusi sentimen per topik. | `DestinationTopicSentimentChart` `DestinationTopicSentimentChart.tsx:26` |
| `web/src/app/(public)/compare/page.tsx` | Route compare | Server Component yang mengambil list destinasi awal. | `getAllDestinations` `page.tsx:10`, `ComparePage` `page.tsx:28` |
| `web/src/components/compare/CompareClient.tsx` | Compare user | Mengatur pemilihan dua destinasi, swap/reset, hasil compare, dan CTA detail. | Komponen utama compare publik |
| `web/src/components/compare/CompareCharts.tsx` | Chart compare | Menampilkan chart sentimen/topik untuk perbandingan. | Komponen chart compare |
| `web/src/app/(public)/profile/page.tsx` | Route profile | Membuka halaman profile user. | `ProfilePage` `page.tsx:9` |
| `web/src/app/(public)/favorites/page.tsx` | Route favorit | Membuka tampilan favorit dengan initial view favorites. | `FavoritesPage` `page.tsx:10` |
| `web/src/components/profile/ProfileClient.tsx` | Profile/favorite workspace | Mengatur profile form, avatar, filter favorit, stats, dan compare tray. | `derivePersonas` `ProfileClient.tsx:103`, `deriveStats` `ProfileClient.tsx:135`, `ProfileClient` `ProfileClient.tsx:155` |
| `web/src/components/profile/profile-components.tsx` | UI profile reusable | Berisi card profile, stat, toolbar favorit, favorite card, empty state, dan compare tray. | `ProfileCard` `profile-components.tsx:20`, `FavoriteCard` `profile-components.tsx:257`, `CompareTray` `profile-components.tsx:400` |

### Auth dan Layout Visual

| Path | Posisi pada flow | Kegunaan | Referensi baris utama |
| --- | --- | --- | --- |
| `web/src/app/(auth)/login/page.tsx` | Login UI | Menangani login form, tombol Google login/register, submit, error, simpan token, dan redirect user. | `LoginContent` `page.tsx:35`, `LoginPage` `page.tsx:226` |
| `web/src/app/(auth)/register/page.tsx` | Register UI | Menangani register form dan transisi ke login/session. | Route register |
| `web/src/components/providers.tsx` | Provider client | Memasang QueryClient, Toaster, dan `GoogleOAuthProvider` jika `NEXT_PUBLIC_GOOGLE_CLIENT_ID` tersedia. | `Providers` `providers.tsx:10` |
| `web/src/components/layout/Navbar.tsx` | Navbar public | Navigasi utama user, auth action, dan brand. | `Navbar` `Navbar.tsx:23` |
| `web/src/components/layout/Footer.tsx` | Footer public | Informasi footer dan link bawah halaman. | `Footer` `Footer.tsx:10` |
| `web/src/components/layout/AdminSidebar.tsx` | Navigasi admin | Menu dashboard admin dan route management. | `AdminSidebar` `AdminSidebar.tsx:31` |
| `web/src/components/layout/AdminTopbar.tsx` | Topbar admin | Header admin, status user, dan action global. | `AdminTopbar` `AdminTopbar.tsx:31` |

### Admin Workspace dan Service API

| Path | Posisi pada flow | Kegunaan | Referensi baris utama |
| --- | --- | --- | --- |
| `web/src/app/admin/page.tsx` | Route dashboard admin | Membuka dashboard ringkasan admin. | `AdminDashboardPage` `page.tsx:9` |
| `web/src/components/admin/dashboard/AdminDashboardClient.tsx` | Dashboard admin | Mengambil summary admin dan menampilkan metric, action queue, dan chart. | `sentimentRatio` `AdminDashboardClient.tsx:105`, `AdminDashboardClient` `AdminDashboardClient.tsx:111` |
| `web/src/app/admin/detail/page.tsx` | Route analitik detail | Membuka analisis satu destinasi untuk admin. | `AdminDetailAnalyticsPage` |
| `web/src/app/admin/destinations/page.tsx` | Route admin destinasi | Membaca search params awal dan merender table destinasi. | `AdminDestinationsPage` `page.tsx:18` |
| `web/src/components/admin/destinations/destinations-table.tsx` | Container destinasi admin | Mengatur query, filter, sort, bulk action, preview, delete, dan modal form. | `DestinationsTable` `destinations-table.tsx:192` |
| `web/src/components/admin/destinations/destinations-table.controls.tsx` | Kontrol destinasi | Filter bar dan bulk toolbar untuk table destinasi. | `DestinationFilterBar` `destinations-table.controls.tsx:6`, `BulkToolbar` `destinations-table.controls.tsx:94` |
| `web/src/components/admin/destinations/destinations-table.data.tsx` | Table destinasi | Row table, empty/loading state, preview drawer, dan delete dialog. | `DestinationsDataTable` `destinations-table.data.tsx:12`, `DestinationPreviewDrawer` `destinations-table.data.tsx:243` |
| `web/src/components/admin/destinations/destinations-table.visuals.tsx` | Visual destinasi admin | Overview cards, legend, dan chart kualitas/rating/kota. | `DestinationOverviewCards` `destinations-table.visuals.tsx:5`, `DestinationQualityChart` `destinations-table.visuals.tsx:195` |
| `web/src/components/admin/destinations/destination-form-modal.tsx` | Form destinasi | Modal create/update destinasi, termasuk kategori, lokasi, media, dan validasi. | `DestinationFormModal` `destination-form-modal.tsx:54` |
| `web/src/components/admin/destinations/thumbnail-uploader.tsx` | Upload thumbnail | Input file/URL thumbnail destinasi. | `ThumbnailUploader` `thumbnail-uploader.tsx:14` |
| `web/src/components/admin/destinations/gallery-uploader.tsx` | Upload gallery | Input banyak foto galeri destinasi. | `GalleryUploader` `gallery-uploader.tsx:19` |
| `web/src/app/admin/reviews/page.tsx` | Route admin review | Membaca tab/filter awal lalu merender review workspace. | `AdminReviewsPage` `page.tsx:18` |
| `web/src/components/admin/reviews/AdminReviewsClient.tsx` | Container review admin | Mengatur tab review/analytics dan sinkronisasi filter URL. | `AdminReviewsClient` `AdminReviewsClient.tsx:38` |
| `web/src/components/admin/reviews/ReviewsTable.tsx` | Table review admin | Mengelola filter review, export CSV, preview, bulk delete, dan state data. | `ReviewsTable` `ReviewsTable.tsx:125` |
| `web/src/components/admin/reviews/reviews-table.controls.tsx` | Kontrol review | Filter bar dan bulk toolbar review. | `ReviewFilterBar` `reviews-table.controls.tsx:6`, `ReviewBulkToolbar` `reviews-table.controls.tsx:149` |
| `web/src/components/admin/reviews/reviews-table.data.tsx` | Data review UI | Table, badge confidence, empty state, preview drawer, dan dialog hapus. | `ReviewDataTable` `reviews-table.data.tsx:9`, `ReviewPreviewDrawer` `reviews-table.data.tsx:214` |
| `web/src/components/admin/reviews/DestinationAnalytics.tsx` | Analytics review | Chart dan ringkasan sentiment/topic per destinasi. | `DestinationAnalytics` `DestinationAnalytics.tsx:41` |
| `web/src/components/admin/topics/TopicsClient.tsx` | Topic admin | Container query, mutation, filter, pagination, dan state dialog/drawer taxonomy. | Container topic admin |
| `web/src/components/admin/topics/topics-client.panels.tsx` | Panel topic admin | Hero, command panel, metric grid, cloud, naming debt, action queue, checklist, dan badge status. | Panel presentational topic |
| `web/src/components/admin/topics/topics-client.group-manager.tsx` | CRUD topic group | Form create/edit group dan pemilihan topik detail dalam group. | `TopicGroupManager` |
| `web/src/components/admin/topics/topics-client.drawers.tsx` | Drawer topic admin | Drawer destinasi terkait topik dan drawer ulasan berdasarkan topik. | `TopicReviewsDrawer`, `TopicDestinationsDrawer` |
| `web/src/components/admin/topics/topics-client.analytics.tsx` | Workspace analytics topic | Lazy-load chart coverage dan menggabungkan chart, cloud, naming debt, action queue. | `TopicAnalyticsWorkspace` |
| `web/src/components/admin/topics/TopicAnalyticsCharts.tsx` | Chart topic admin | Visual coverage dan distribusi topic. | `TopicCoverageParetoChart` |
| `web/src/components/admin/scraper/ScraperClient.tsx` | Scraper admin | Mengatur job scraping, filter, statistik, dan pagination. | `ScraperClient` `ScraperClient.tsx:63` |
| `web/src/components/admin/scraper/scraper-components.tsx` | UI scraper | Command panel, health strip, chart, job table, dan pagination footer. | `ScraperCommandPanel` `scraper-components.tsx:10`, `JobMonitorTable` `scraper-components.tsx:190` |
| `web/src/components/admin/nlp/NlpProcessingClient.tsx` | NLP admin | Container upload file review, preflight dedup, mode proses, history state, dan submit. | `NlpProcessingClient` |
| `web/src/components/admin/nlp/nlp-processing.panels.tsx` | Panel NLP admin | Command panel, preflight panel, mode selector, stepper, history, dan hero metric. | `NlpCommandPanel`, `NlpHistoryPanel` |
| `web/src/components/admin/nlp/nlp-processing.result.tsx` | Hasil NLP admin | Empty/loading/result workspace, stacked sentiment, dan action lanjutan. | `NlpResultWorkspace` |
| `web/src/components/admin/users/UsersClient.tsx` | User admin | Manajemen user, filter, table, dan insight panel. | `UsersClient` `UsersClient.tsx:92` |
| `web/src/components/admin/users/UserFormModal.tsx` | Form user admin | Modal create/update user. | `UserFormModal` `UserFormModal.tsx:46` |
| `web/src/components/admin/users/UserDetailModal.tsx` | Detail user admin | Modal detail user dan aktivitas terkait. | Komponen detail user |
| `web/src/components/admin/compare/CompareClient.tsx` | Compare admin | Perbandingan dua destinasi, trend decision signal, chart, dan rekomendasi admin. | `CompareClient` |
| `web/src/components/admin/compare/AdminSingleAnalysisClient.tsx` | Analitik detail admin | Analisis satu destinasi untuk signal health, risiko sentimen, gambaran situasi tempat, sinyal operasional, topik prioritas, dan tindakan dinas. | `AdminSingleAnalysisClient` |
| `web/src/services/admin/*.service.ts` | Data layer admin | Membungkus request admin agar komponen tidak memanggil Axios mentah. | Contoh `adminDestinationService` `destination.service.ts:64`, `adminNlpService` `nlp.service.ts:47` |

### Komponen UI Dasar

| Path | Posisi pada flow | Kegunaan | Referensi baris utama |
| --- | --- | --- | --- |
| `web/src/components/ui/button.tsx` | UI primitive | Tombol reusable dengan variant dan ukuran konsisten. | `Button` `button.tsx:43` |
| `web/src/components/ui/input.tsx` | UI primitive | Input reusable untuk form public/admin. | `Input` `input.tsx:6` |
| `web/src/components/ui/native-select.tsx` | UI primitive | Select custom untuk filter/form; dropdown memakai portal agar tidak terpotong container overflow. | `NativeSelect` |
| `web/src/components/ui/dialog.tsx` | UI primitive | Dialog/modal berbasis Radix. | `DialogContent` `dialog.tsx:42` |
| `web/src/components/ui/sheet.tsx` | UI primitive | Sheet/drawer untuk panel samping atau mobile. | `SheetContent` `sheet.tsx:39` |
| `web/src/components/ui/table.tsx` | UI primitive | Elemen table reusable untuk admin. | `Table` `table.tsx:7` |
| `web/src/components/ui/avatar.tsx` | UI primitive | Avatar dan fallback profile. | `Avatar` `avatar.tsx:8` |
| `web/src/components/charts/ChartPanel.tsx` | Chart wrapper | Panel chart reusable dengan loading state. | `ChartPanel` `ChartPanel.tsx:10` |

## Flow File ke Fungsi Web

1. **Render awal public**: `layout.tsx:12` memasang root, `(public)/layout.tsx:4` memasang navbar/footer, lalu route seperti `(public)/page.tsx:32` atau search/detail merender komponen masing-masing.
2. **Request API**: komponen client memakai `api` dari `axios.ts:11`; state login dibaca dari `useAuthStore` `auth.store.ts:42`.
3. **Search**: `SearchClient.tsx:69` mengatur input/filter, memanggil backend, lalu `SearchResultCard.tsx:71` menampilkan hasil dengan kategori dan top topic.
4. **Detail destinasi**: `destinations/[slug]/page.tsx:36` fetch data server-side, `DestinationDetailClient.tsx:179` mengatur interaksi, `TopicInsightSection.tsx:117` menampilkan topik, dan `ReviewFormSection.tsx:30` mengirim ulasan.
5. **Admin**: route admin membaca search params, container seperti `destinations-table.tsx:192` atau `ReviewsTable.tsx:125` mengatur state, lalu komponen `*.controls.tsx`, `*.data.tsx`, dan `*.visuals.tsx` memecah tampilan.
6. **Service admin**: file `src/services/admin/*.service.ts` menjadi lapisan request agar komponen UI tetap fokus pada state dan render.
Catatan layout landing terbaru: `HeroSection` kembali menjadi hero utama dengan search, quick prompt, dan trust signal. Timecard dipindahkan ke `TrendingCarousel` sebagai section rekomendasi destinasi. Kontrol manual slider dihapus; implementasi timecard memakai stack kartu absolut seperti referensi `Komponen`, sehingga kartu rekomendasi berikutnya membesar langsung dari posisi kanan bawah menjadi background penuh sebelum teks destinasi baru muncul. Kartu yang sedang membesar tetap berada di layer background agar tidak menutup preview slider. Tinggi visual section dibuat tetap, preview card diposisikan lebih rendah agar jaraknya dari nama destinasi aktif lebih lega, dan timer dibuat lebih pendek agar tidak menimpa kartu.
