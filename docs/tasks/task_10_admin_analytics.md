# Task 10: Admin Destination Analytics & Compare (Admin)

Modul panel admin untuk melihat analisis sentimen, ulasan, dan metrik tren secara mendalam.

## Rincian Pekerjaan:
1. **Destination Analytics Detail**: Halaman laporan lengkap mencakup sentimen, ulasan terbaru, rating Google vs User.
2. **Word Cloud & Topic Distribution**: Visualisasi NLP dari kata kunci dan topik yang paling banyak dibicarakan di suatu destinasi.
3. **Recalculate Button**: Aksi trigger manual agar backend (Analytics Service) menghitung ulang kalkulasi matriks sentimen destinasi tersebut.
4. **Admin Compare Panel**: Fitur membandingkan matriks analitik dua destinasi berdampingan khusus perspektif admin.

## Endpoint Terkait:
- `GET /api/admin/destinations/:id`
- `GET /api/analytics/destination/:id`
- `GET /api/analytics/destination/:id/topics`
- `GET /api/analytics/trends/:id`
- `POST /api/admin/analytics/recalculate/:destinationId`
- `GET /api/analytics/compare`
- `GET /api/admin/analytics/export/:destinationId` (Download CSV)
