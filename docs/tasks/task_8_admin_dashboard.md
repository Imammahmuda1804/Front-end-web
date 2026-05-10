# Task 8: Admin Dashboard (Admin)

Halaman utama (Dashboard) untuk panel admin yang berisi ringkasan eksekutif performa seluruh platform.

## Rincian Pekerjaan:
1. **Summary Cards**: Menampilkan metrik utama (total destinasi, total ulasan, rata-rata rating, sistem status).
2. **Global Sentiment Trend**: Menampilkan Line Chart grafik tren keseluruhan sentimen pada platform.
3. **Top Recommendation Ranking**: Menampilkan destinasi dengan skor rekomendasi tertinggi.
4. **Recent Activity**: Menampilkan log aktivitas sistem atau pengguna terakhir.

## Endpoint Terkait:
- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/activity`
- `GET /api/admin/dashboard/trends`
