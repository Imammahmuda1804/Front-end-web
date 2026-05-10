# Task 9: Admin Destination Management (Admin)

Modul manajemen data master destinasi wisata untuk admin (Create, Read, Update, Delete).

## Rincian Pekerjaan:
1. **Destination Table**: Tabel daftar destinasi wisata dengan fitur pagination, search, dan filter.
2. **Destination Form (Create & Update)**: Form dinamis menggunakan React Hook Form + Zod untuk menginput data destinasi baru atau merubah yang sudah ada.
3. **Maps URL Management**: Field/Form khusus untuk merubah atau menetapkan link Google Maps.
4. **Gallery Uploader**: Komponen drag-and-drop / upload file untuk menambahkan gambar galeri dari destinasi terkait.
5. **Delete Image/Destination**: Fungsionalitas penghapusan gambar atau *soft delete* destinasi.

## Endpoint Terkait:
- `GET /api/admin/destinations`
- `POST /api/admin/destinations`
- `PUT /api/admin/destinations/:id`
- `DELETE /api/admin/destinations/:id`
- `PUT /api/admin/destinations/:id/maps-url`
- `POST /api/admin/destinations/:id/images`
- `DELETE /api/admin/destinations/images/:imageId`
