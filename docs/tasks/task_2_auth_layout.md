# Task 2: Authentication & Layouting

Menyelesaikan layouting global (User & Admin) dan flow otentikasi login/register.

## Rincian Pekerjaan:
1. Pembuatan komponen Layout User: Navbar (Public & Authenticated state) dan Footer.
2. Pembuatan komponen Layout Admin: Sidebar navigasi dan Topbar.
3. Setup Next.js Middleware untuk memproteksi route `/admin` dan `/profile`.
4. Halaman Register: Form register dengan validasi Zod.
5. Halaman Login: Form login dengan validasi Zod dan penyimpanan token via cookies/Zustand.

## Endpoint Terkait:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
