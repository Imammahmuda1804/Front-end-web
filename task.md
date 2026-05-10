# Task 1: Setup & Core Architecture

- [x] Inisialisasi Next.js 15 App Router menggunakan TypeScript dan Tailwind CSS.
- [x] Inisialisasi dan konfigurasi Shadcn/ui.
- [x] Setup Theme provider (next-themes) untuk dark/light mode.
- [x] Setup folder structure sesuai standar (features, components, services, lib, dsb).
- [x] Setup Zustand store dasar (contoh: AuthStore, ThemeStore).
- [x] Setup TanStack Query (QueryClientProvider).
- [x] Konfigurasi Axios Interceptors untuk BaseURL backend, auto-inject Token, dan refresh token handling.

# Task 2: Authentication & Layouting
- [x] Pembuatan komponen Layout User: Navbar (Public & Authenticated state) dan Footer.
- [x] Pembuatan komponen Layout Admin: Sidebar navigasi dan Topbar.
- [x] Setup Next.js Middleware untuk memproteksi route `/admin` dan `/profile`.
- [x] Halaman Register: Form register dengan validasi Zod (Modern Minimalist Redesign).
- [x] Halaman Login: Form login dengan validasi Zod dan penyimpanan token via cookies/Zustand (Modern Minimalist Redesign).

# Task 3: Landing Page (Execution)

## 1. Setup & UI Foundation
- [x] Install `embla-carousel-react` (or `framer-motion` / `lucide-react` if missing).
- [x] Update `Navbar.tsx` (Remove dark mode, use RANAHINSIGHT identity, clean styling).

## 2. API Integration Hooks (Real Endpoints)
- [x] Implement SSR Fetching untuk `GET /api/destinations/recommendations` ke backend (`http://localhost:3000/api/...`) di `page.tsx`.

## 3. Landing Page Sections (`page.tsx`)
- [x] **Hero Section**:
  - Implement full-screen impact background.
  - Implement "Semantic Search Bar".
- [x] **Trending Carousel**:
  - Fetch `GET /api/destinations/recommendations` (or `ranking`).
  - Render Embla Carousel dengan *cards* berestetika *Joy Vibes*.
- [x] **Topic Filter Chips**:
  - Diintegrasikan ke halaman pencarian, di Hero Section ditampilkan tags default.
- [x] **App Information / AI Analytics**:
  - Implement 2-column "Intelligence Behind Your Trip" cards.
- [x] **Bento Grid Insights**:
  - Render statistik grid di bagian bawah.

## 4. BOLD Aesthetic & Polish
- [x] Terapkan *Scroll-Triggered Storytelling* (framer-motion atau tailwind animation).
- [x] Pastikan tidak ada `glassmorphism` tebal, gunakan *soft white overlay*.
- [x] Responsivitas diuji (Mobile -> Desktop).

# Tasks 4 - 12 (To Be Continued)
- [x] Task 4: Search Result Page (User)
- [x] Task 5: Detail Destination Page (User)
- [x] Task 6: Compare Destination Page (User)
- [x] Task 7: User Profile & Favorites Page (User)
- [x] Task 8: Admin Dashboard (Admin)
- [x] Task 9: Admin Destination Management (Admin)
- [ ] Task 10: Admin Destination Analytics & Compare (Admin)
- [ ] Task 11: Admin Review Analysis / Scraper (Admin)
- [ ] Task 12: Admin User Management (Admin)
