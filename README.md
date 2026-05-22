# RANAHINSIGHT Web Service

Folder `web` berisi aplikasi web RANAHINSIGHT berbasis Next.js App Router. Web ini menyediakan halaman publik untuk user dan dashboard admin untuk mengelola destinasi, review, topik, NLP, scraper, user, serta analytics.

## Kegunaan Service

Web dipakai untuk:

- landing page RANAHINSIGHT;
- pencarian destinasi keyword dan semantic;
- detail destinasi dengan gallery, topic insight, review, dan favorite;
- compare destinasi;
- profile dan favorite user;
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
- Zustand.

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
| `src/components/home/` | Hero, carousel trending, info section, dan bento landing. |
| `src/components/search/` | Search workspace dan result card. |
| `src/components/destinations/` | Detail destinasi, gallery, topic insight, review form, dan chart. |
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
2. `SearchClient` mengatur input dan filter.
3. Request dikirim ke `POST /api/search`.
4. Result ditampilkan dengan `SearchResultCard`.

Contoh admin destinasi:

1. Admin login.
2. Middleware mengecek cookie auth.
3. Route `/admin/destinations` membuka table admin.
4. `adminDestinationService` memanggil backend.
5. Admin bisa create, update, delete, upload thumbnail, dan upload gallery.

## Auth dan Route Protection

File utama:

- `src/store/auth.store.ts`
- `src/middleware.ts`
- `src/app/(auth)/login/page.tsx`
- `src/components/layout/Navbar.tsx`

Alur:

1. Login mengirim email/password ke backend.
2. Backend mengembalikan user dan token.
3. Token/user disimpan di store dan cookie.
4. Middleware memakai cookie untuk proteksi route.
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
- `/admin/nlp-processing`
- `/admin/scraper`
- `/admin/users`

## Troubleshooting

### Semua route 404

Periksa:

- route file masih ada di `src/app`;
- `middleware.ts` tidak salah redirect;
- Next dev server dijalankan dari folder `web`;
- jangan hapus/migrasi middleware ke proxy tanpa test semua route.

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
