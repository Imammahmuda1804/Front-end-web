# Task 7: User Profile & Favorites Page (User)

Halaman khusus pengguna untuk manajemen profil, melihat riwayat pencarian, dan melihat destinasi favorit.

## Rincian Pekerjaan:
1. **Profile Header & Edit Form**: Menampilkan data profil aktif dan form untuk memperbarui data (seperti nama, foto, password).
2. **Favorite Grid**: Menampilkan daftar destinasi yang di-bookmark/favoritkan pengguna dalam bentuk grid.
3. **Remove Favorite**: Fungsionalitas hapus destinasi dari daftar favorit (optimistic update UI).
4. **Search & Review History**: Tabel/list sederhana untuk melacak aktivitas pencarian terbaru atau riwayat review pengguna.

## Endpoint Terkait:
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/favorites`
- `DELETE /api/favorites/:destinationId`
- `GET /api/search/history`
