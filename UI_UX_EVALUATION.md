# RANAHINSIGHT — Evaluasi UI/UX Menyeluruh

> Metode: impeccable `audit` (teknis: a11y, performa, responsif) + `critique` (UX heuristik)
> Register: Product UI (admin) + Brand (halaman publik)
> Design System Referensi: DESIGN.md — Joy Vibes Minimalist, Tropical Orange, Plus Jakarta Sans

---

## Ringkasan Eksekutif

| Halaman | Skor Critique | Skor Audit | Prioritas |
|---|---|---|---|
| Navbar (Publik) | 7/10 | 6/10 | Sedang |
| Beranda (Home) | 8/10 | 6/10 | Sedang |
| Login / Register | 8/10 | 7/10 | Rendah |
| Pencarian (Search) | 7/10 | 6/10 | Tinggi |
| Detail Destinasi | 8/10 | 6/10 | Sedang |
| Admin Sidebar | 4/10 | 5/10 | Tinggi |
| Admin Topbar | 4/10 | 5/10 | Tinggi |
| Admin Dashboard | 7/10 | 6/10 | Sedang |
| Admin Scraper | 8/10 | 7/10 | Rendah |

---

## 1. Navbar (Publik)

**File:** `src/components/layout/Navbar.tsx`

### Critique

**Kekuatan:**
- Active state link dengan `after:` pseudo-element cukup elegan
- Dropdown user menu memiliki konteks (nama + email) sebelum aksi
- Mobile sheet navigation berfungsi dengan baik

**Masalah:**
- `bg-white/80 backdrop-blur-md` — ini glassmorphism, **dilarang di DESIGN.md**. Ganti ke `bg-white border-b border-slate-200`
- Navbar height `h-20` terlalu tinggi untuk konten yang ada; `h-16` lebih proporsional
- Tidak ada `aria-label` pada `<nav>` element
- Logo menggunakan `<img>` biasa, bukan `next/image` — performa suboptimal
- Label "Daftar Sekarang" vs "Masuk" — CTA sudah tepat, tapi pada mobile sheet keduanya ukuran sama padahal hierarki berbeda
- Dropdown tidak menutup saat navigasi berpindah halaman (tidak ada `onSelect` atau `SheetClose` handler)

**Saran:**
```
1. Hapus backdrop-blur, ganti ke solid white dengan border
2. Tambah aria-label="Navigasi Utama" pada <nav>
3. Ganti <img> logo ke next/image dengan width/height eksplisit
4. Perkecil h-20 → h-16
5. Tambah visually-hidden skip-to-content link di awal body
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Keyboard navigation | Partial | Dropdown bisa diakses, tapi Sheet trigger tidak punya visible focus ring |
| ARIA labels | Gagal | `<nav>` tanpa label, Sheet trigger hanya `sr-only` |
| `next/image` | Gagal | Memakai `<img>` biasa |
| Glassmorphism ban | Gagal | `backdrop-blur-md` melanggar DESIGN.md |
| Responsive | Lulus | Mobile sheet berfungsi |
| Contrast | Lulus | `text-slate-600` pada white background ≥4.5:1 |

---

## 2. Beranda — HeroSection

**File:** `src/components/home/HeroSection.tsx`

### Critique

**Kekuatan:**
- Framer Motion scale-in pada background image memberikan kesan sinematik
- Search bar pill dengan tag suggestion cukup engaging
- Wave SVG transisi ke section berikutnya halus

**Masalah:**
- `<motion.img>` tidak menggunakan `next/image` — LCP image tidak dioptimasi, tidak ada `priority` attribute, tidak ada `sizes`
- `text-primary-fixed` bukan token valid di DESIGN.md; warna tidak terdefinisi
- Search `<input>` tidak punya `id` dan `<label>` eksplisit — gagal a11y
- Suggestion tags menggunakan `<button>` tanpa `type="button"` — bisa trigger form submit di beberapa browser
- `backdrop-blur-sm` pada badge "AI-Powered Tourism" — glassmorphism kecil, tapi konsisten melanggar

**Saran:**
```
1. Ganti motion.img → <div style background-image> atau gunakan next/image fill mode dengan priority
2. Ganti text-primary-fixed → text-[#FF7B54] atau CSS var(--color-primary)
3. Tambah <label htmlFor="hero-search" className="sr-only"> pada input
4. Tambah type="button" pada semua suggestion buttons
5. Hapus backdrop-blur dari badge kecil
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| LCP optimization | Gagal | Hero image bukan next/image, tidak ada priority |
| Form accessibility | Gagal | Input tanpa label eksplisit |
| CLS risk | Sedang | Wave SVG bisa menyebabkan CLS jika lambat |
| Motion safety | Gagal | Tidak ada `prefers-reduced-motion` guard |
| Performance | Gagal | motion.img tidak lazy, tidak ada srcset |

---

## 3. Beranda — TrendingCarousel

**File:** `src/components/home/TrendingCarousel.tsx`

### Critique

**Kekuatan:**
- Embla carousel implementasi clean, drag-free feel natural
- Hover reveal AI Sentiment panel — delight yang elegan
- Asimetri tombol navigasi (outline vs filled) membantu hierarki

**Masalah:**
- `<img>` biasa bukan `next/image` — 7 gambar tanpa lazy load otimasi
- Heart button di carousel tidak fungsional (tidak ada onClick handler) — dead affordance
- Carousel tidak punya `aria-label`, `role="region"`, atau `aria-roledescription="carousel"`
- `whileInView` + `delay: index * 0.1` pada item carousel akan sangat terlambat untuk item ke-6 (0.6s delay)

**Saran:**
```
1. Ganti semua <img> → next/image dengan sizes="(max-width: 768px) 85vw, 30vw"
2. Hapus Heart button atau hubungkan ke favorites API
3. Tambah aria-label="Rekomendasi Destinasi Teratas" pada <section>
4. Batasi delay maksimal 0.3s atau hilangkan animasi per-item
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Image optimization | Gagal | 7 img tags tanpa next/image |
| ARIA carousel | Gagal | Tidak ada role/label |
| Dead affordance | Gagal | Heart button tanpa fungsi |
| Motion overkill | Sedang | Delay terlalu panjang pada item akhir |

---

## 4. Beranda — InfoSection & BentoGrid

**File:** `src/components/home/InfoSection.tsx`, `BentoGrid.tsx`

### Critique — InfoSection

**Kekuatan:**
- Layout dua kolom simetris bersih
- Animated progress bar pada hover area efektif menunjukkan data
- Ikon berubah warna saat hover — micro-interaction tepat

**Masalah:**
- Dua kartu identik strukturnya (icon + h3 + p + widget) — melanggar "identical card grids" ban impeccable
- `blur-3xl` pada decorative circle — rendah intensitasnya tapi tetap perlu justifikasi
- Tag `#CULTURE #NATURE` dll menggunakan `#` prefix tapi bukan hashtag interaktif — membingungkan

**Critique — BentoGrid**

**Kekuatan:**
- Layout bento asimetris (2-col + 1-col span) mencegah grid monoton
- Dark section kontras dengan white section sebelumnya
- Decorative `blur-[120px]` orbs memberikan atmosphere tepat

**Masalah:**
- Stats "1.2M+" — angka hardcoded, bukan data nyata. Ini misleading
- `onClick={() => window.location.href = '/search'}` pada `<motion.div>` — bukan accessible, gunakan `<Link>` atau `<a>`
- `bg-secondary` box terakhir menggunakan `bg-[url('/images/auth-bg.jpg')]` overlay — gambar dimuat ulang untuk dekorasi kecil
- `rounded-[2.5rem]` konsisten di semua bento — terlalu seragam, mengurangi ritme visual

**Saran:**
```
1. InfoSection: buat dua kartu lebih berbeda (layout asimetris, satu text-heavy satu visual-heavy)
2. BentoGrid: ganti angka hardcoded ke placeholder atau tambah komentar jelas "placeholder"
3. Ganti motion.div clickable → <Link> dengan role="link"
4. Hapus background image dari CTA box atau gunakan CSS pattern sebagai gantinya
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Interactive elements | Gagal | div onClick di BentoGrid, bukan semantic link |
| Data integrity | Sedang | Angka hardcoded bisa disalahartikan sebagai real data |
| Image redundancy | Sedang | auth-bg.jpg dimuat ulang sebagai dekorasi |
| Identical cards | Gagal | InfoSection melanggar identical card ban |

---

## 5. Login

**File:** `src/app/(auth)/login/page.tsx`

### Critique

**Kekuatan:**
- Split-screen sesuai DESIGN.md specification
- AI Cards overlay pada photo panel memberikan brand storytelling
- Password show/hide toggle diimplementasi dengan benar
- Zod validation dengan react-hook-form = pattern terbaik

**Masalah:**
- "RANAHINSIGHT" dengan `<span className="text-primary">INSIGHT</span>` memecah nama brand secara visual — pertimbangkan apakah ini konsisten dengan logo asli
- Wave SVG gradient di bottom menggunakan `url(#wave-grad)` — linear gradient ini redundan dengan background putih halaman
- Floating cards menggunakan `bg-white/70 backdrop-blur-sm` — glassmorphism **dilarang**
- `opacity-70` pada kedua overlay cards — terlalu gelap, mengurangi keterbacaan
- "Ingat saya" checkbox tidak punya implementasi (`useEffect` untuk persist tidak ada)
- "Lupa password?" link ke `href="#"` — broken link / dead affordance

**Saran:**
```
1. Hapus wave SVG gradient — halaman sudah cukup dengan clean white
2. Ganti glass cards di image panel → solid white cards dengan shadow
3. Implementasikan atau hapus "Ingat saya" checkbox
4. Tambah halaman /forgot-password atau sembunyikan link sementara
5. Tambah autocomplete="email" dan autocomplete="current-password" pada inputs
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Autocomplete attrs | Gagal | Inputs tanpa autocomplete attribute |
| Glassmorphism ban | Gagal | backdrop-blur pada overlay cards |
| Dead links | Gagal | "Lupa password?" ke # |
| Form labels | Lulus | Label eksplisit ada |
| Error messages | Lulus | Zod messages ditampilkan inline |

---

## 6. Pencarian (SearchClient)

**File:** `src/components/search/SearchClient.tsx`

### Critique

**Kekuatan:**
- Dual mode pencarian (semantic + topic filter) elegant
- Skeleton loading state detail dan proporsional
- History pencarian hanya ditampilkan untuk user login — konteks tepat
- AnimatePresence siap untuk transisi hasil

**Masalah:**
- Kolom "Rec Score" di result card menampilkan angka tanpa satuan atau penjelasan — user awam tidak mengerti artinya
- Vibe filter menggunakan custom checkbox dengan `<input type="checkbox" className="hidden">` — bukan accessible; screen reader tidak akan membacanya
- `positive_ratio` ditampilkan sebagai angka desimal (`0.87`) bukan persentase (`87%`) — formatting bug
- Search button berwarna `bg-slate-900` — tidak konsisten dengan design system primary orange
- Empty state terlalu verbosa — paragraf panjang padahal user hanya perlu satu kalimat
- `executeSearch` dipanggil dari `useEffect` dengan dependensi kosong `[]` — eslint-hooks violation

**Saran:**
```
1. Ganti Rec Score → label "Skor AI" dengan tooltip penjelasan
2. Ganti custom checkbox hidden → gunakan shadcn Checkbox atau <button role="checkbox" aria-checked>
3. Format positive_ratio: (nilai * 100).toFixed(0) + "%"
4. Ganti search button slate-900 → bg-primary text-white
5. Persingkat empty state copy: "Tidak ada hasil. Coba kata kunci lain."
6. Pindah initial search ke useCallback dengan dependensi proper
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Accessible checkbox | Gagal | hidden input, tidak terbaca screen reader |
| Data formatting | Gagal | Ratio tidak dikonversi ke % |
| Color consistency | Gagal | Search button warna tidak sesuai DS |
| Hook compliance | Sedang | useEffect dependency array kosong |
| Loading state | Lulus | Skeleton proporsional |
| Empty state | Sedang | Terlalu verbose |

---

## 7. Detail Destinasi (DestinationDetailClient)

**File:** `src/components/destinations/DestinationDetailClient.tsx`

### Critique

**Kekuatan:**
- Hero section dengan zoom hover + dual gradient overlay sinematik
- Three-tab layout (Overview, Galeri, Ulasan) mengorganisasi konten padat dengan baik
- Sentiment trend chart dengan Recharts terintegrasi apik di sidebar
- Favorite toggle dengan optimistic UI (meskipun tidak fully optimistic — delay ada)

**Masalah:**
- `<img>` digunakan di seluruh komponen (~5 tempat) — zero next/image usage di halaman paling penting
- "AI MATCH SCORE" badge menggunakan `bg-white/20 backdrop-blur-md` — glassmorphism lagi
- Quick Stats Bar: tiga kartu identik (icon kanan, label + angka kiri) — identical card pattern
- `onClick={() => window.open(...)}` pada stat card "Lokasi" — div clickable bukan anchor
- Galeri: `grid-cols-3` tapi item pertama `md:col-span-2 md:row-span-2` tanpa explicit `grid-rows` — layout bisa collapse
- Ulasan: user avatar placeholder menggunakan `bg-primary/20` background dengan huruf — baik, tapi inconsistent dengan profil navbar yang pakai icon `User`
- Tab tidak dapat diakses keyboard dengan `role="tablist"` dan `aria-selected`
- `checkFavoriteStatus` fetches semua favorites (limit 100) untuk cek satu item — sangat tidak efisien

**Saran:**
```
1. Ganti semua <img> → next/image
2. AI Match badge: hapus backdrop-blur, ganti solid bg-primary/90
3. Quick Stats: buat kartu berbeda (rating pakai star visual, positif pakai progress bar, lokasi pakai map icon besar)
4. Lokasi stat: ganti div clickable → <a href={googleMapsUrl} target="_blank" rel="noopener">
5. Galeri grid: tambah grid-rows-2 explicit
6. Tab: tambah role="tablist", role="tab", aria-selected, aria-controls
7. checkFavoriteStatus: gunakan endpoint /api/favorites/check/:id jika ada, atau cache hasilnya
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| next/image | Gagal | 0 dari ~5 img elements menggunakan next/image |
| Glassmorphism ban | Gagal | Badge backdrop-blur |
| Tab a11y | Gagal | Tidak ada role tablist/tab |
| Clickable div | Gagal | Stat "Lokasi" harusnya anchor |
| API efficiency | Gagal | Fetch 100 items untuk cek 1 |
| Identical cards | Gagal | 3 stat cards identik strukturnya |

---

## 8. Admin Sidebar

**File:** `src/components/layout/AdminSidebar.tsx`

### Critique

**Masalah Kritikal:**
- Brand name di sidebar "Wisata AI Admin" — tidak konsisten dengan brand RANAHINSIGHT di publik
- Label menu "Review Analysis" menunjuk ke `/admin/scraper` — nama halaman tidak mencerminkan fungsi scraper
- Tidak ada logo/gambar brand — hanya ikon `MapPin` sebagai pengganti logo
- `min-h-screen sticky top-0` — kombinasi ini tidak bekerja sempurna; sidebar akan scroll keluar viewport di konten panjang. Gunakan `h-screen overflow-y-auto fixed` atau layout dengan flex parent
- Active state hanya berdasarkan `pathname === link.href` — jika ada sub-routes, tidak akan terdeteksi kecuali `startsWith` (yang sudah ada tapi belum di semua item)
- Tidak ada indikasi visual yang cukup kuat — border kiri yang tebal (>1px) untuk active state **dilarang**, tapi solusi `bg-primary text-white` yang ada sudah tepat
- `w-64` fixed width tanpa kemampuan collapse — tidak ada mobile-friendly sidebar collapse

**Saran:**
```
1. Ganti "Wisata AI Admin" → "RANAHINSIGHT" dengan logo icon
2. Rename menu "Review Analysis" → "Engine Room" atau "Scraper & NLP"
3. Ganti layout ke h-screen flex flex-col fixed inset-y-0 left-0
4. Tambah collapse button untuk responsivitas desktop
5. Tambah aria-current="page" pada active link
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Brand consistency | Gagal | "Wisata AI Admin" ≠ RANAHINSIGHT |
| Sticky layout | Gagal | min-h-screen sticky tidak reliable |
| Keyboard nav | Sedang | Links keyboard-accessible tapi tanpa aria-current |
| Mobile | Gagal | Tidak ada collapse, hidden di mobile tapi Topbar punya Sheet |

---

## 9. Admin Topbar

**File:** `src/components/layout/AdminTopbar.tsx`

### Critique

**Masalah:**
- Dark mode toggle tersedia (`useTheme`) — padahal DESIGN.md secara eksplisit **melarang** dark mode default dan menyebutkan app heavily optimizes for Light Mode. Toggle ini inkonsisten
- "Wisata AI Admin" di mobile Sheet — brand salah lagi
- User dropdown trigger hanya menampilkan nama teks (`{user?.name}`), tidak ada avatar — tidak konsisten dengan navbar publik yang punya avatar
- `flex flex-1` kosong sebagai spacer — menggunakan div kosong sebagai spacer bukan praktik terbaik. Gunakan `justify-end` pada container
- Mobile Sheet di topbar duplikat navigasi dengan AdminSidebar — dua sumber navigasi admin

**Saran:**
```
1. Hapus dark mode toggle dari admin (atau buat kebijakan tema konsisten)
2. Tambah avatar placeholder di user dropdown trigger
3. Hapus div flex-1 spacer, gunakan justify-between atau ml-auto
4. Unifikasi mobile navigation — pilih satu: topbar Sheet atau sidebar drawer
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Theme consistency | Gagal | Dark mode toggle berlawanan DESIGN.md |
| Brand naming | Gagal | "Wisata AI Admin" |
| Duplicate navigation | Gagal | Sheet di topbar + Sidebar |
| Avatar presence | Sedang | Nama saja, tidak ada visual user identity |

---

## 10. Admin Dashboard — SummaryCards

**File:** `src/components/admin/dashboard/SummaryCards.tsx`

### Critique

**Kekuatan:**
- Warna pastel per-kartu (kuning, merah muda, ungu, biru) memberikan visual differensiasi yang jelas
- Trend badge (+12%, -2%) memberikan konteks cepat
- "See Details" CTA pada setiap kartu — navigasi jelas

**Masalah Kritikal:**
- Ini adalah **hero-metric template** yang dilarang impeccable: big number + small label + trend + gradient accent. Tapi dalam konteks admin dashboard sebagai **product** register, pengecualian dapat diterima jika tidak diubah menjadi brand page
- Trend percentage (+12%, -2%, +18%, +5%) adalah **hardcoded** — tidak dari data nyata. Sangat misleading untuk production
- `MoreHorizontal` button di sudut kanan setiap kartu tidak memiliki handler — dead affordance
- Link `/admin/reviews` pada kartu Reviews — route ini tidak ada di sidebar atau app structure yang terdeteksi
- Warna kartu (FEF08A, FECDD3, E9D5FF, BAE6FD) tidak terdefinisi di DESIGN.md/globals.css — warna arbitrary di luar design system

**Saran:**
```
1. Hapus trend percentages hardcoded atau fetch dari API real
2. Hapus MoreHorizontal button atau implementasikan menu-nya
3. Perbaiki link /admin/reviews ke route yang benar
4. Tambah warna kartu ke design system tokens atau gunakan warna dari existing palette
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Hardcoded data | Gagal | Semua trend % adalah dummy |
| Dead affordances | Gagal | MoreHorizontal tanpa fungsi |
| Broken route | Gagal | /admin/reviews tidak ada |
| Design tokens | Sedang | Warna arbitrary di luar DS |

---

## 11. Admin Scraper (ScraperClient) — Baru Diupdate

**File:** `src/components/admin/scraper/ScraperClient.tsx`

### Critique

**Kekuatan (setelah refactor):**
- Form disederhanakan — hanya field yang relevan
- Info panel "Filter Aktif (Dikunci)" memberikan transparansi proses
- Status badges proporsional dan konsisten
- Kolom "Ulasan" menggantikan progress bar yang tidak reliable

**Sisa Masalah:**
- `adminDestinationService.getDestinations` tanpa error state — jika gagal, dropdown diam-diam kosong tanpa feedback ke user
- Select dropdown belum punya virtual scroll — jika ada 100+ destinasi, performa bisa buruk
- Polling interval 5000ms hardcoded — tidak ada jitter/backoff jika API lambat
- Tombol refresh manual di Monitor Panel tidak memberikan feedback visual (loading state)
- Error message di kolom "Ulasan" dipotong 30 karakter — tooltip sudah ada, tapi mobile tidak mendukung hover tooltip

**Saran:**
```
1. Tambah error state pada fetchDestinations dengan toast.error fallback
2. Tambah maxHeight + overflow-y-auto pada SelectContent untuk list panjang
3. Refresh button: tambah isRefreshing state dengan animate-spin
4. Error message: pertimbangkan expandable row atau dedicated error dialog untuk mobile
```

### Audit

| Kriteria | Status | Catatan |
|---|---|---|
| Error handling | Sedang | Silent catch di fetchDestinations |
| Polling robustness | Sedang | Tidak ada exponential backoff |
| Mobile tooltip | Sedang | Error text tidak accessible di mobile |
| Long list perf | Sedang | Tidak ada virtual scroll |

---

## Temuan Global — Lintas Halaman

### 1. `<img>` vs `next/image`

**Kritis.** Hampir seluruh codebase menggunakan `<img>` biasa:
- `HeroSection.tsx` — hero image (LCP element!)
- `TrendingCarousel.tsx` — 7 gambar
- `DestinationDetailClient.tsx` — thumbnail + galeri
- `Navbar.tsx` — logo
- `login/page.tsx` — foto dan logo

Tanpa `next/image`, tidak ada: format WebP/AVIF otomatis, lazy loading, CLS prevention, responsive srcset.

**Fix:** Ganti semua ke `next/image`. Untuk external URLs, tambahkan domain ke `next.config.ts`:
```js
images: {
  remotePatterns: [{ hostname: 'lh3.googleusercontent.com' }, ...]
}
```

### 2. Glassmorphism Dilarang Tapi Tersebar

DESIGN.md melarang glassmorphism. Ditemukan di:
- Navbar: `backdrop-blur-md`
- HeroSection badge: `backdrop-blur-sm`
- Login overlay cards: `backdrop-blur-sm`
- Destination hero badge: `backdrop-blur-md`
- TrendingCarousel AI panel: `backdrop-blur-md`

**Fix sistematis:** Cari `backdrop-blur` di seluruh codebase dan ganti ke solid backgrounds.

### 3. Brand Identity Inconsistency (Admin vs Publik)

Publik menggunakan "RANAHINSIGHT". Admin menggunakan "Wisata AI Admin" di dua tempat (Sidebar + Topbar Sheet). Tidak ada logo di admin panel.

### 4. Dead Affordances

Tombol/link tanpa fungsi:
- Heart button di TrendingCarousel
- MoreHorizontal di setiap SummaryCard
- "Lupa password?" ke `#`
- Nomor statistik dummy di BentoGrid
- Trend percentage hardcoded di SummaryCards

### 5. Accessibility Gaps Sistematis

- Tidak ada skip-to-content link
- Carousel tanpa ARIA region/label
- Tab navigation di DestinationDetail tanpa `role="tablist"`
- Custom checkboxes di SearchClient tanpa `aria-checked`
- Banyak `<img>` tanpa dimensi eksplisit (CLS risk)

### 6. Motion tanpa `prefers-reduced-motion`

Framer Motion digunakan ekstensif tanpa guard:
```tsx
// Tambahkan di setiap motion component:
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// atau gunakan useReducedMotion() dari framer-motion
```

---

## Prioritas Perbaikan

### Tinggi (Langsung Perbaiki)

1. **Ganti semua `<img>` → `next/image`** — LCP, CLS, bandwidth
2. **Hapus semua `backdrop-blur`** — melanggar DESIGN.md
3. **Fix Admin brand** — "Wisata AI Admin" → RANAHINSIGHT
4. **Hapus trend percentage hardcoded** di SummaryCards
5. **Fix dead links** — "Lupa password?", Heart button, MoreHorizontal

### Sedang (Sprint Berikutnya)

6. **ARIA improvements** — nav label, tablist, carousel, checkbox
7. **Unifikasi mobile admin navigation** — pilih satu system
8. **Hapus dark mode toggle** dari admin topbar (inkonsisten DESIGN.md)
9. **Format data** — positive_ratio ke %, Rec Score dengan penjelasan
10. **Fix clickable divs** — ganti ke semantic anchor/button

### Rendah (Backlog)

11. `prefers-reduced-motion` guard di Framer Motion
12. Exponential backoff untuk polling
13. Virtual scroll untuk dropdown destinasi 100+
14. `autocomplete` attribute pada semua form inputs
15. Skip-to-content link

---

*Evaluasi dibuat: 2026-05-11 | Metode: static code analysis + impeccable audit/critique*
*File ini dapat diperbarui setelah tiap siklus perbaikan*
