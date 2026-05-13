# Implementasi Perbaikan UI/UX RANAHINSIGHT

Berdasarkan hasil evaluasi dari `UI_UX_EVALUATION.md`, berikut adalah rencana implementasi yang dibagi menjadi 3 fase prioritas. Setiap task dapat ditandai `[x]` jika sudah selesai.

---

## 🔴 Fase 1: Prioritas Tinggi (Kritis untuk Performa & Konsistensi Brand)

### 1.1 Optimasi Gambar (LCP & CLS)
- [ ] **Konfigurasi Next.js**: Update `next.config.ts` untuk mengizinkan domain gambar eksternal (Google Maps/Places API, AWS S3, dll).
- [ ] **`HeroSection.tsx`**: Ganti `<motion.img>` dengan `<Image>` (dari `next/image`), tambahkan properti `priority`, `fill`, dan `sizes`.
- [ ] **`TrendingCarousel.tsx`**: Ganti 7 elemen `<img>` menjadi `<Image>` dengan properti `sizes`.
- [ ] **`DestinationDetailClient.tsx`**: Ganti `<img>` pada thumbnail banner dan galeri dengan `<Image>`.
- [ ] **`Navbar.tsx`**: Ganti logo `<img>` dengan `<Image>` dan set width/height eksplisit.
- [ ] **`login/page.tsx`**: Ganti foto overlay dan logo dengan `<Image>`.

### 1.2 Kepatuhan Design System (Hapus Glassmorphism)
- [ ] **`Navbar.tsx`**: Ubah `bg-white/80 backdrop-blur-md` menjadi warna solid `bg-white` dengan border bawah.
- [ ] **`HeroSection.tsx`**: Hapus class `backdrop-blur-sm` dari badge "AI-Powered Tourism".
- [ ] **`login/page.tsx`**: Hapus `backdrop-blur-sm` dan `opacity-70` pada floating cards; ganti dengan background solid putih dan shadow yang elegan.
- [ ] **`DestinationDetailClient.tsx`**: Ubah badge "AI MATCH SCORE" dari `backdrop-blur-md` menjadi solid background (contoh: `bg-primary/90`).
- [ ] **`TrendingCarousel.tsx`**: Hapus `backdrop-blur-md` dari panel AI Insight.

### 1.3 Konsistensi Brand Admin
- [ ] **`AdminSidebar.tsx`**: Ganti teks "Wisata AI Admin" menjadi "RANAHINSIGHT" dan sertakan ikon logo.
- [ ] **`AdminTopbar.tsx`**: Ganti teks "Wisata AI Admin" di dalam *mobile Sheet* menjadi "RANAHINSIGHT".
- [ ] **`AdminSidebar.tsx`**: Ubah label menu "Review Analysis" menjadi "Engine Room" atau "Scraper & NLP" agar sesuai konteks.

### 1.4 Integritas Data & Dead Affordances
- [ ] **`SummaryCards.tsx` (Admin)**: Hapus tren persentase hardcoded (`+12%`, `-2%`, dll) atau hubungkan ke data analitik sebenarnya.
- [ ] **`SummaryCards.tsx` (Admin)**: Perbaiki dead link dari tombol `MoreHorizontal` (implementasikan dropdown atau hapus), dan perbaiki routing `/admin/reviews` yang salah.
- [ ] **`BentoGrid.tsx`**: Beri anotasi visual yang jelas bahwa data "1.2M+" adalah data placeholder, atau hubungkan ke statistik DB nyata.
- [ ] **`TrendingCarousel.tsx`**: Hapus tombol *Heart* jika tidak digunakan, atau hubungkan fungsi `toggleFavorite` ke tombol tersebut.
- [ ] **`login/page.tsx`**: Sembunyikan atau perbaiki tautan "Lupa password?" yang mengarah ke `#`.

---

## 🟡 Fase 2: Prioritas Sedang (Aksesibilitas & Penyempurnaan UX)

### 2.1 Peningkatan Aksesibilitas (A11y)
- [ ] **`Navbar.tsx`**: Tambahkan atribut `aria-label="Navigasi Utama"` pada elemen `<nav>`.
- [ ] **`HeroSection.tsx`**: Tambahkan elemen `<label htmlFor="hero-search" className="sr-only">` untuk input pencarian.
- [ ] **`TrendingCarousel.tsx`**: Tambahkan `aria-label="Rekomendasi Destinasi Teratas"` dan pertimbangkan `role="region"`.
- [ ] **`SearchClient.tsx`**: Ganti input checkbox tersembunyi dengan tombol aksesibel (`<button role="checkbox" aria-checked={...}>`) atau komponen Shadcn.
- [ ] **`DestinationDetailClient.tsx`**: Tambahkan `role="tablist"`, `role="tab"`, dan atribut `aria-selected` pada navigasi tab overview/galeri/ulasan.

### 2.2 Navigasi & Tema Admin
- [ ] **`AdminTopbar.tsx`**: Hapus *toggle* Dark Mode (aplikasi ini optimal untuk Light Mode sesuai spesifikasi `DESIGN.md`).
- [ ] **Unifikasi Navigasi Mobile Admin**: Pilih satu pendekatan (Sheet di Topbar *atau* Drawer/Sheet yang ditangani via Sidebar) untuk menghindari duplikasi struktur.
- [ ] **`AdminSidebar.tsx`**: Perbaiki layout yang menggunakan `min-h-screen sticky` menjadi solusi yang lebih kokoh untuk layout dashboard (`h-screen overflow-y-auto fixed` atau `flex flex-col`).

### 2.3 Pemformatan Data & Elemen Semantik
- [ ] **`SearchClient.tsx`**: Ubah format `positive_ratio` (misal `0.87`) menjadi persentase visual (`87%`).
- [ ] **`SearchClient.tsx`**: Ubah label "Rec Score" menjadi "Skor AI" dan tambahkan tooltip ringkas yang menjelaskan arti skor tersebut.
- [ ] **`DestinationDetailClient.tsx`**: Ubah blok *clickable div* "Lokasi Google Maps" menjadi tag semantik `<a>` dengan `target="_blank" rel="noopener noreferrer"`.
- [ ] **`BentoGrid.tsx`**: Ganti blok `<motion.div>` yang dapat diklik (Link Peta) menjadi elemen `<Link>` Next.js.

---

## 🟢 Fase 3: Prioritas Rendah (Backlog & Polish)

### 3.1 Animasi & Performa Lanjutan
- [ ] **`HeroSection` & `TrendingCarousel`**: Tambahkan logika pengecekan `prefers-reduced-motion` untuk menonaktifkan atau menyederhanakan animasi bagi user yang membutuhkannya.
- [ ] **`ScraperClient.tsx`**: Implementasikan logika *exponential backoff* pada interval *polling* monitoring job scraper.
- [ ] **`ScraperClient.tsx`**: Jika daftar destinasi bertambah pesat (100+), implementasikan *virtual scroll* (misal dengan `react-window` atau `@tanstack/react-virtual`) di dalam komponen `Select`.

### 3.2 Detail Form
- [ ] **`login/page.tsx`**: Tambahkan atribut semantik `autocomplete` (`email`, `current-password`) pada form input.
- [ ] **Global**: Tambahkan elemen "Skip to content" (visually hidden) di awal body halaman publik untuk mempermudah navigasi keyboard.
