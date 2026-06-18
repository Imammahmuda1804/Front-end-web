---
target: web/src/components/routes
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-16T15-01-30Z
slug: src-components-routes
---
# Design Critique: Halaman Rute Pariwisata (web/src/components/routes)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Tidak ada spinner loading saat pencarian destinasi di builder. |
| 2 | Match System / Real World | 3 | Label dan urutan stop natural. |
| 3 | User Control and Freedom | 2 | Menghapus stop di builder instan tanpa tombol undo atau konfirmasi. |
| 4 | Consistency and Standards | 2 | Tinggi tombol/input tidak konsisten (min-h-10, min-h-11, min-h-12). |
| 5 | Error Prevention | 3 | Form divalidasi dengan baik sebelum disimpan. |
| 6 | Recognition Rather Than Recall | 4 | Nama destinasi dan kota ditampilkan jelas di rute. |
| 7 | Flexibility and Efficiency | 2 | Tidak ada shortcut keyboard untuk menambah stop atau menyimpan. |
| 8 | Aesthetic and Minimalist Design | 3 | Menggunakan kelas boilerplate slop "on-photo-*" tanpa background foto nyata. |
| 9 | Error Recovery | 3 | Error API di-toast dengan baik. |
| 10 | Help and Documentation | 2 | Tidak ada petunjuk cara kerja fitur "Urutkan otomatis". |
| **Total** | | **27/40** | **Acceptable** |

## Anti-Patterns Verdict
- **Verdict**: PASS. Kode fungsional dan terstruktur dengan baik, namun membawa class boilerplate AI slop (`on-photo-rule`, `on-photo-kicker`, `on-photo-heading`) padahal elemen berada di atas background putih/sand biasa, bukan di atas foto.
- **Tells**: Eyebrow kecil dengan tracking lebar di setiap section (`RoutesClient.tsx:74` dan `SavedRoutesClient.tsx:103`).

## Overall Impression
Halaman rute dan perencana perjalanan secara umum memiliki UX yang solid dan andal. Integrasi peta interaktif Mapcn menyempurnakan kegunaan rute. Namun, inkonsistensi ukuran tombol, ketiadaan tombol undo saat menghapus stop, dan sisa boilerplate visual slop mengurangi nuansa premium antarmuka ini.

## What's Working
- **Mapcn Live Sync**: Sinkronisasi garis rute dan marker (hilang saat dikunjungi) yang instan meningkatkan rasa kontrol pengguna secara drastis.
- **Visual Feedback pada State**: Indikasi visual yang jelas pada status stop di tracker (Hijau: Dikunjungi, Oranye: Selanjutnya, Putih: Menunggu).

## Priority Issues
- **[P1] Tinggi Tombol Tidak Konsisten (Consistency)**:
  - *Why*: Terdapat variasi tinggi tombol/input yang membingungkan (`min-h-10`, `min-h-11`, `min-h-12`) di seluruh form dan panel aksi rute.
  - *Fix*: Standardisasi tinggi tombol aksi menjadi `min-h-11` (44px) untuk kenyamanan sentuh dan visual yang seragam.
  - *Suggested command*: $impeccable layout
- **[P1] Ketiadaan Undo untuk Hapus Stop (User Control)**:
  - *Why*: Menghapus stop perjalanan di builder langsung menghapus data beserta note tanpa konfirmasi, memicu frustrasi jika tidak sengaja terklik.
  - *Fix*: Tambahkan notifikasi toast dengan aksi "Undo" atau tampilkan dialog konfirmasi sebelum penghapusan.
  - *Suggested command*: $impeccable harden
- **[P2] Kicker Eyebrow Slop (Anti-Pattern)**:
  - *Why*: Penggunaan kicker all-caps kecil di atas judul utama meniru pola klise desain AI generatif.
  - *Fix*: Ganti pola header rute dengan typography terintegrasi yang lebih elegan tanpa kicker terpisah.
  - *Suggested command*: $impeccable typeset
- **[P2] Ketidakjelasan Fitur Urutkan Otomatis (Help)**:
  - *Why*: Tombol urutkan otomatis hanya memiliki ikon Sparkles, yang bisa disalahartikan sebagai generator AI acak.
  - *Fix*: Tambahkan tooltip atau sub-text singkat "Urutkan berdasarkan jarak terdekat".
  - *Suggested command*: $impeccable clarify

## Persona Red Flags
- **Alex (Impatient Power User)**: Terlalu banyak klik untuk menyusun rute. Tidak ada cara cepat menekan `Enter` setelah memilih destinasi di selector untuk langsung menambahkannya ke stop.
- **Jordan (First-Timer)**: Ikon Sparkles pada "Urutkan otomatis" membingungkan Jordan mengenai apa yang sebenarnya terjadi (apakah ini mengacak rute atau mengurutkan secara logis).
- **Riley (Stress Tester)**: Mencoba menghapus stop di tengah jalan dan kehilangan semua catatan perhentian tanpa opsi pengembalian (no undo).
