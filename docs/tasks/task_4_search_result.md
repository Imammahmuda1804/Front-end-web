# Task 4: Search Result Page (User)

Menampilkan hasil pencarian berbasis semantic natural language beserta filternya. Mengacu pada instruksi Task 4 dan referensi visual dari *VibeTravel - Search Results*, kita akan membangun antarmuka pencarian semantik yang kuat dengan *layout* *sidebar* dan *grid*.

## Rincian Pekerjaan & Proposed Implementation

### 1. Struktur Halaman & State Management
- **`src/app/(public)/search/page.tsx`**: Halaman rute utama (Server/Client) yang merender UI.
- **`src/components/search/SearchClient.tsx`** (atau sejenisnya): *Client Component* untuk menangani kompleksitas *state* pencarian (kueri input, hasil, *loading*, *filters*, dan *history*).

### 2. Komponen Antarmuka Utama
- **Sidebar (Kiri)**:
  - **Recent Searches**: Memanggil `GET /api/search/history` (jika pengguna login). Jika salah satu riwayat diklik, akan otomatis mengisi kotak pencarian dan mengeksekusi `POST /api/search`.
  - **Vibe Filters**: Memanggil `GET /api/topics` untuk merender daftar *checkbox* topik. Memilih filter ini akan menggunakan `GET /api/destinations?topic_id=X`.
- **Main Area (Kanan)**:
  - **Search Header**: Menampilkan tulisan "SHOWING RESULTS FOR..." beserta total hasil dan metrik AI.
  - **Result Grid**: Merender daftar *card* destinasi.
  - **Destination Card**: Memiliki struktur khusus: persentase kecocokan (*similarity*), nama destinasi, nilai rekomendasi (*recommendationScore*), tag/topik, rasio positif ulasan (*positiveRatio*), dan tautan jelajah.

### 3. Estetika (Joy Vibes)
- Latar belakang terang (`bg-slate-50`) dengan *card* putih (*border-slate-100*, *shadow-sm*).
- Tipografi judul utama menggunakan `Plus Jakarta Sans` berbobot tebal (`font-black` / `font-bold`).
- Warna aksen biru (`primary`) atau oranye sesuai identitas.

---

## 🛑 Open Questions (Butuh Keputusan Anda)

**1. Autentikasi pada Search History**
Pada dokumentasi API, *endpoint* `GET /api/search/history` berstatus `Protected (USER, ADMIN)`. Bagaimana jika pengguna *belum login* namun masuk ke halaman pencarian? 
👉 **Usulan saya**: Bagian "Recent Searches" di *sidebar* hanya dirender jika pengguna sudah login. Jika tamu (publik), bagian riwayat ini disembunyikan. Setuju?

**2. Interaksi Filter vs Semantic Search**
*Semantic search* (`POST /api/search`) **tidak menerima** parameter `topic_id`. Sebaliknya, API Topik (`GET /api/destinations?topic_id=...`) **tidak menerima** *semantic query*. Keduanya adalah *endpoint* yang berbeda fungsinya.
👉 **Usulan saya**: Keduanya bekerja secara bergantian (*mutual exclusion*). Jika pengguna mengetik pencarian semantik, maka centang topik di *sidebar* akan dibatalkan/dikosongkan. Jika pengguna mencentang topik, kueri di kotak pencarian akan dikosongkan. Setuju?

---
## Endpoint Terkait:
- `POST /api/search`
- `GET /api/destinations?topic_id=...`
- `GET /api/topics`
- `GET /api/search/history` (Protected)
- `DELETE /api/search/history` (Protected)
