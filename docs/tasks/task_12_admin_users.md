# Task 12: Admin User Management (Admin)

Halaman untuk mengatur pengguna platform.

## Rincian Pekerjaan:
1. **User Table**: Menampilkan seluruh data user aplikasi dengan pagination.
2. **User Modification**: Modal form untuk mengubah role (*User / Admin*), menyetujui, atau men-*suspend* akun user.
3. **User Deletion**: Tindakan *soft-delete* atau *hard-delete* (menghapus paksa akun pengguna dari sistem).
4. **User Activity Tracking**: Log ringkas terkait aktivitas terakhir yang dilakukan user tersebut.

## Endpoint Terkait:
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
