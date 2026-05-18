"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUserService, AdminUser } from "@/services/admin/user.service";
import { UserDetailModal } from "./UserDetailModal";
import { UserFormModal } from "./UserFormModal";

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
      <section className="overflow-hidden rounded-[1.75rem] border border-orange-200 bg-[#fff3ea] shadow-sm">
        <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ff7b54] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
              User Operations
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Manajemen Pengguna
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-700 md:text-base">
              Kelola akun, role, status akses, dan sinyal aktivitas pengguna dalam satu workspace
              operasional yang mudah dipantau.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroMetric
              icon={Users}
              label="Total pengguna"
              value={meta.total || 0}
              tone="orange"
            />
            <HeroMetric
              icon={CheckCircle2}
              label="Aktif di halaman ini"
              value={activeCount}
              tone="emerald"
            />
            <HeroMetric
              icon={Shield}
              label="Akun admin"
              value={adminCount}
              tone="blue"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HealthCard
          label="Status aktif"
          value={`${activePercent}%`}
          caption={`${activeCount} dari ${users.length} pengguna pada halaman ini`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <HealthCard
          label="Ditangguhkan"
          value={suspendedCount}
          caption="Akun yang perlu ditinjau atau diaktifkan ulang"
          icon={ShieldOff}
          tone="rose"
        />
        <HealthCard
          label="Role admin"
          value={`${adminPercent}%`}
          caption={`${adminCount} admin dan ${userCount} user biasa`}
          icon={Shield}
          tone="blue"
        />
        <HealthCard
          label="Hasil tampil"
          value={filteredUsers.length}
          caption={`Halaman ${meta.page || page} dari ${totalPages}`}
          icon={Activity}
          tone="orange"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_11rem_12rem]">
                <div className="space-y-2">
                  <label htmlFor="user-search" className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7b54]">
                    Cari pengguna
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="user-search"
                      placeholder="Nama atau email pengguna"
                      className="h-12 rounded-2xl border-slate-200 pl-11 font-semibold shadow-none focus-visible:ring-[#ff7b54]"
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
                  className="h-12 rounded-full bg-[#ff7b54] px-5 font-extrabold text-white shadow-sm hover:bg-[#f0653f]"
                  onClick={openAdd}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengguna
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7b54]">
                  User Directory
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {filteredUsers.length} pengguna ditampilkan
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                <Filter className="h-4 w-4 text-[#2d82b5]" />
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
                          <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
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
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff3ea] text-sm font-black text-[#ff7b54] ring-1 ring-orange-200">
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
                              <Eye className="h-4 w-4 text-[#2d82b5]" />
                            </IconAction>
                            <IconAction label={`Edit ${user.name}`} onClick={() => openEdit(user)}>
                              <Edit className="h-4 w-4 text-[#ff7b54]" />
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
            firstColor="bg-[#ff7b54]"
            secondLabel="User"
            secondValue={userCount}
            secondColor="bg-[#2d82b5]"
          />
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7b54]">
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

      <Dialog open={pendingStatusUser !== null} onOpenChange={(open) => !open && setPendingStatusUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingStatusUser?.status === "suspended" ? "Aktifkan akun?" : "Tangguhkan akun?"}
            </DialogTitle>
            <DialogDescription>
              {pendingStatusUser?.status === "suspended"
                ? `Akun ${pendingStatusUser?.name} akan bisa login dan menggunakan platform kembali.`
                : `Akun ${pendingStatusUser?.name} akan dinonaktifkan dan tidak bisa login sementara.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setPendingStatusUser(null)}
              disabled={isStatusSubmitting}
            >
              Batal
            </Button>
            <Button
              className="rounded-full bg-[#ff7b54] text-white hover:bg-[#f0653f]"
              onClick={confirmStatusChange}
              disabled={isStatusSubmitting}
            >
              {isStatusSubmitting ? "Memproses..." : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: "orange" | "emerald" | "blue";
}) {
  const toneClass = {
    orange: "bg-orange-100 text-[#ff7b54]",
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-[#2d82b5]",
  }[tone];

  return (
    <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}

function HealthCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: React.ElementType;
  tone: "orange" | "emerald" | "rose" | "blue";
}) {
  const toneClass = {
    orange: "bg-orange-50 text-[#ff7b54]",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-sky-50 text-[#2d82b5]",
  }[tone];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{caption}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7b54]">
        {label}
      </span>
      <NativeSelect
        aria-label={`Filter ${label.toLowerCase()} pengguna`}
        value={value}
        onValueChange={onChange}
        options={options}
        className="bg-white"
      />
    </div>
  );
}

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
        isAdmin
          ? "bg-orange-50 text-[#ff7b54] ring-1 ring-orange-200"
          : "bg-sky-50 text-[#2d82b5] ring-1 ring-sky-200"
      }`}
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      }`}
    >
      {isActive ? "Aktif" : "Ditangguhkan"}
    </span>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      className="h-10 w-10 rounded-full border-slate-200 bg-white"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function DistributionCard({
  title,
  description,
  firstLabel,
  firstValue,
  firstColor,
  secondLabel,
  secondValue,
  secondColor,
}: {
  title: string;
  description: string;
  firstLabel: string;
  firstValue: number;
  firstColor: string;
  secondLabel: string;
  secondValue: number;
  secondColor: string;
}) {
  const total = Math.max(firstValue + secondValue, 1);
  const firstPercent = Math.round((firstValue / total) * 100);
  const secondPercent = 100 - firstPercent;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className={firstColor} style={{ width: `${firstPercent}%` }} />
        <div className={secondColor} style={{ width: `${secondPercent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <DistributionLegend label={firstLabel} value={firstValue} color={firstColor} />
        <DistributionLegend label={secondLabel} value={secondValue} color={secondColor} />
      </div>
    </div>
  );
}

function DistributionLegend({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs font-bold text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function QueueItem({
  icon: Icon,
  title,
  caption,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  caption: string;
  tone: "orange" | "rose" | "blue";
}) {
  const toneClass = {
    orange: "bg-orange-50 text-[#ff7b54]",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-sky-50 text-[#2d82b5]",
  }[tone];

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900">{title}</p>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{caption}</p>
      </div>
    </div>
  );
}
