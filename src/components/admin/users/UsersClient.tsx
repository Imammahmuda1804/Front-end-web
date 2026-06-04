"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Edit,
  Eye,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { adminUserService, AdminUser } from "@/services/admin/user.service";
import { UserDetailModal } from "./UserDetailModal";
import { UserFormModal } from "./UserFormModal";
import {
  DistributionCard,
  FilterSelect,
  IconAction,
  QueueItem,
  RoleBadge,
  StatusBadge,
} from "./users-client.components";
import { UsersOverview } from "./users-overview";
import { UserStatusDialog } from "./user-status-dialog";

type RoleFilter = "all" | "ADMIN" | "USER";
type StatusFilter = "all" | "active" | "suspended";

interface UsersMeta {
  total?: number;
  total_pages?: number;
  page?: number;
}

const limit = 10;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

function getResponseData(data: unknown): { users: AdminUser[]; meta: UsersMeta } {
  const response = data as {
    data?: AdminUser[] | { data?: AdminUser[]; meta?: UsersMeta };
    meta?: UsersMeta;
  };
  const rawData = response?.data || data;
  const users = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as { data?: AdminUser[] })?.data)
      ? (rawData as { data: AdminUser[] }).data
      : [];
  const meta = response?.meta || (rawData as { meta?: UsersMeta })?.meta || {};
  return {
    users,
    meta: {
      total: meta.total || users.length,
      total_pages: meta.total_pages || 1,
      page: meta.page || 1,
    },
  };
}

// Mengelola daftar user, filter, create, edit, suspend, dan delete.
export function UsersClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [pendingStatusUser, setPendingStatusUser] = useState<AdminUser | null>(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

  React.useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => window.clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", debouncedSearch, page, limit],
    queryFn: () =>
      adminUserService.getUsers({
        search: debouncedSearch,
        page,
        limit,
      }),
  });

  const { users, meta } = useMemo(() => getResponseData(data), [data]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const roleMatch = roleFilter === "all" || user.role === roleFilter;
        const statusMatch = statusFilter === "all" || user.status === statusFilter;
        return roleMatch && statusMatch;
      }),
    [roleFilter, statusFilter, users],
  );

  const activeCount = users.filter((user) => user.status === "active").length;
  const suspendedCount = users.filter((user) => user.status === "suspended").length;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const userCount = users.filter((user) => user.role === "USER").length;
  const totalOnPage = Math.max(users.length, 1);
  const activePercent = Math.round((activeCount / totalOnPage) * 100);
  const adminPercent = Math.round((adminCount / totalOnPage) * 100);
  const hasFilters = Boolean(searchTerm || roleFilter !== "all" || statusFilter !== "all");
  const totalPages = Math.max(meta.total_pages || 1, 1);

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusUser) return;

    const isSuspended = pendingStatusUser.status === "suspended";
    const action = isSuspended ? "mengaktifkan" : "menonaktifkan";

    try {
      setIsStatusSubmitting(true);
      if (isSuspended) {
        await adminUserService.updateUser(pendingStatusUser.id, { status: "active" });
        toast.success(`Akun ${pendingStatusUser.name} berhasil diaktifkan kembali`);
      } else {
        await adminUserService.suspendUser(pendingStatusUser.id);
        toast.success(`Akun ${pendingStatusUser.name} berhasil dinonaktifkan`);
      }
      setPendingStatusUser(null);
      refetch();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        `Gagal ${action} akun`;
      toast.error(msg);
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[100rem] space-y-6">
      <UsersOverview
        totalUsers={meta.total || 0}
        activeCount={activeCount}
        suspendedCount={suspendedCount}
        adminCount={adminCount}
        userCount={userCount}
        usersOnPage={users.length}
        activePercent={activePercent}
        adminPercent={adminPercent}
        currentPage={meta.page || page}
        totalPages={totalPages}
        filteredCount={filteredUsers.length}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_11rem_12rem]">
                <div className="space-y-2">
                  <label htmlFor="user-search" className="text-xs font-black uppercase tracking-[0.18em] text-explore">
                    Cari pengguna
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="user-search"
                      placeholder="Nama atau email pengguna"
                      className="h-12 rounded-xl border-slate-200 pl-11 font-semibold shadow-none focus-visible:ring-[var(--explore)]"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>

                <FilterSelect
                  label="Role"
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value as RoleFilter)}
                  options={[
                    { value: "all", label: "Semua role" },
                    { value: "ADMIN", label: "Admin" },
                    { value: "USER", label: "User" },
                  ]}
                />

                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as StatusFilter)}
                  options={[
                    { value: "all", label: "Semua status" },
                    { value: "active", label: "Aktif" },
                    { value: "suspended", label: "Ditangguhkan" },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full border-slate-200 px-5 font-bold"
                  onClick={resetFilters}
                  disabled={!hasFilters && page === 1}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  className="h-12 rounded-full bg-explore px-5 font-extrabold text-white shadow-sm hover:bg-explore/90"
                  onClick={openAdd}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengguna
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-explore">
                  User Directory
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {filteredUsers.length} pengguna ditampilkan
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                <Filter className="h-4 w-4 text-ai" />
                {hasFilters ? "Filter aktif" : "Semua data halaman"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="min-w-[280px] px-5 py-4">Pengguna</TableHead>
                    <TableHead className="min-w-[140px]">Role</TableHead>
                    <TableHead className="min-w-[150px]">Status</TableHead>
                    <TableHead className="min-w-[160px]">Bergabung</TableHead>
                    <TableHead className="min-w-[180px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={5} className="px-5 py-4">
                          <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-36 text-center">
                        <div className="mx-auto max-w-sm space-y-3">
                          <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
                          <p className="font-bold text-slate-900">Data pengguna gagal dimuat.</p>
                          <Button variant="outline" className="rounded-full" onClick={() => refetch()}>
                            Coba lagi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <div className="mx-auto max-w-sm space-y-3">
                          <Users className="mx-auto h-9 w-9 text-slate-300" />
                          <p className="font-bold text-slate-900">Tidak ada pengguna ditemukan.</p>
                          <p className="text-sm text-slate-500">
                            Ubah kata kunci atau reset filter untuk melihat data lain.
                          </p>
                          <Button variant="outline" className="rounded-full" onClick={resetFilters}>
                            Reset filter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-orange-50/40">
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-explore-container text-sm font-black text-explore ring-1 ring-explore/20">
                              {getInitial(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-slate-950">
                                {user.name}
                              </p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-600">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <IconAction
                              label={`Lihat detail ${user.name}`}
                              onClick={() => setDetailUserId(user.id)}
                            >
                              <Eye className="h-4 w-4 text-ai" />
                            </IconAction>
                            <IconAction label={`Edit ${user.name}`} onClick={() => openEdit(user)}>
                              <Edit className="h-4 w-4 text-explore" />
                            </IconAction>
                            <IconAction
                              label={
                                user.status === "suspended"
                                  ? `Aktifkan ${user.name}`
                                  : `Tangguhkan ${user.name}`
                              }
                              onClick={() => setPendingStatusUser(user)}
                            >
                              {user.status === "suspended" ? (
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <ShieldOff className="h-4 w-4 text-rose-600" />
                              )}
                            </IconAction>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Halaman {meta.page || page} dari {totalPages} · {meta.total || 0} total pengguna
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <DistributionCard
            title="Status pengguna"
            description="Proporsi akun pada halaman data saat ini."
            firstLabel="Aktif"
            firstValue={activeCount}
            firstColor="bg-emerald-500"
            secondLabel="Ditangguhkan"
            secondValue={suspendedCount}
            secondColor="bg-rose-500"
          />
          <DistributionCard
            title="Komposisi role"
            description="Pantau jumlah admin agar akses tetap terkendali."
            firstLabel="Admin"
            firstValue={adminCount}
            firstColor="bg-explore"
            secondLabel="User"
            secondValue={userCount}
            secondColor="bg-ai"
          />
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-explore">
              Action Queue
            </p>
            <div className="mt-4 space-y-3">
              <QueueItem
                icon={ShieldOff}
                title={`${suspendedCount} akun ditangguhkan`}
                caption="Tinjau apakah akun perlu dipulihkan."
                tone="rose"
              />
              <QueueItem
                icon={Shield}
                title={`${adminCount} akun admin`}
                caption="Pastikan akses admin hanya untuk operator aktif."
                tone="blue"
              />
              <QueueItem
                icon={Search}
                title={hasFilters ? "Filter sedang aktif" : "Direktori siap dipantau"}
                caption={
                  hasFilters
                    ? "Reset filter untuk melihat data halaman penuh."
                    : "Gunakan filter untuk audit role atau status tertentu."
                }
                tone="orange"
              />
            </div>
          </div>
        </aside>
      </section>

      <UserFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => refetch()}
        initialData={editingUser}
      />

      <UserDetailModal
        userId={detailUserId}
        open={detailUserId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailUserId(null);
        }}
      />

      <UserStatusDialog
        user={pendingStatusUser}
        submitting={isStatusSubmitting}
        onClose={() => setPendingStatusUser(null)}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}
