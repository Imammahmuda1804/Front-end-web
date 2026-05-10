"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Eye, ShieldOff, ShieldCheck, Plus } from "lucide-react";
import { adminUserService, AdminUser } from "@/services/admin/user.service";
import { toast } from "sonner";
import { UserFormModal } from "./UserFormModal";
import { UserDetailModal } from "./UserDetailModal";

export function UsersClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", debouncedSearch, page, limit],
    queryFn: () =>
      adminUserService.getUsers({
        search: debouncedSearch,
        page,
        limit,
      }),
  });

  const handleSuspend = async (user: AdminUser) => {
    const action = user.status === "suspended" ? "mengaktifkan" : "menonaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} akun ${user.name}?`)) return;

    try {
      if (user.status === "suspended") {
        // Reactivate
        await adminUserService.updateUser(user.id, { status: "active" });
        toast.success(`Akun ${user.name} berhasil diaktifkan kembali`);
      } else {
        // Suspend
        await adminUserService.suspendUser(user.id);
        toast.success(`Akun ${user.name} berhasil dinonaktifkan`);
      }
      refetch();
    } catch {
      toast.error(`Gagal ${action} akun`);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  // Handle TransformInterceptor response
  const rawData = data?.data || data;
  const users: AdminUser[] = Array.isArray(rawData) ? rawData : rawData?.data || [];
  const meta = data?.meta || rawData?.meta || { total_pages: 1, page: 1, total: 0 };

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="rounded-lg border bg-card text-card-foreground p-4 flex-1">
          <p className="text-sm text-muted-foreground">Total Pengguna</p>
          <p className="text-2xl font-bold">{meta.total || 0}</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground p-4 flex-1">
          <p className="text-sm text-muted-foreground">Halaman</p>
          <p className="text-2xl font-bold">{meta.page || 1} / {meta.total_pages || 1}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Tidak ada pengguna ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  {/* User info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium leading-none">{user.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role badge */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>

                  {/* Status badge */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {user.status === "active" ? "Aktif" : "Ditangguhkan"}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Detail Pengguna"
                      onClick={() => setDetailUserId(user.id)}
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Edit Pengguna"
                      onClick={() => openEdit(user)}
                    >
                      <Edit className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title={user.status === "suspended" ? "Aktifkan" : "Tangguhkan"}
                      onClick={() => handleSuspend(user)}
                    >
                      {user.status === "suspended" ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldOff className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan halaman {meta.page} dari {meta.total_pages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page === meta.total_pages || isLoading || meta.total_pages === 0}
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      {/* User Form Modal (Add/Edit) */}
      <UserFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => refetch()}
        initialData={editingUser}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        userId={detailUserId}
        open={detailUserId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailUserId(null);
        }}
      />
    </div>
  );
}
