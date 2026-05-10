# Task 5: Detail Destination Page (User)

Halaman lengkap untuk melihat informasi satu destinasi, sentimen, dan ulasan.

## Rincian Pekerjaan:
1. **Destination Header & Gallery**: Menampilkan judul, rating, deskripsi, dan galeri gambar grid/carousel.
2. **Sentiment & Topic Insight Charts**: Integrasi library Recharts untuk menampilkan grafik sentimen ulasan (positif/negatif) dan distribusi topik (Word Cloud / Bar).
3. **Recommendation Insight**: Menampilkan grafik trend rekomendasi/sentimen terbaru.
4. **Review List**: Menampilkan daftar ulasan dari pengguna lain.
5. **Review Form**: Form bagi user (yang sudah login) untuk menambahkan ulasan & rating.
6. **Favorite Button**: Tombol interaktif untuk menambah/menghapus destinasi dari list favorit.

## Endpoint Terkait:
- `GET /api/destinations/:id`
- `GET /api/analytics/destination/:id`
- `GET /api/analytics/destination/:id/topics`
- `GET /api/analytics/trends/:id`
- `POST /api/user-reviews`
- `POST /api/favorites/:destinationId`
- `DELETE /api/favorites/:destinationId`
