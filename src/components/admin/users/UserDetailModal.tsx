"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Calendar,
  Heart,
  Mail,
  MapPin,
  Search,
  Shield,
  Star,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminUserService, AdminUserDetail } from "@/services/admin/user.service";

interface UserDetailModalProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabKey = "reviews" | "favorites" | "searches";

const tabs: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
  { key: "reviews", label: "Ulasan", icon: Star },
  { key: "favorites", label: "Favorit", icon: Heart },
  { key: "searches", label: "Pencarian", icon: Search },
];

function formatDate(value: string, withTime = false) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
  });
}

function normalizeImageUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return value;
  }
  return value;
}

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

export function UserDetailModal({ userId, open, onOpenChange }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("reviews");

  const { data: user, isLoading } = useQuery<AdminUserDetail>({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => adminUserService.getUserDetail(userId!),
    enabled: open && userId !== null,
  });

  const tabCounts = useMemo(
    () => ({
      reviews: user?.userReviews?.length || 0,
      favorites: user?.favorites?.length || 0,
      searches: user?.searchLogs?.length || 0,
    }),
    [user],
  );

  const latestActivity = useMemo(() => {
    if (!user) return "-";
    const dates = [
      ...user.userReviews.map((item) => item.createdAt),
      ...user.favorites.map((item) => item.createdAt),
      ...user.searchLogs.map((item) => item.createdAt),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0] ? formatDate(dates[0], true) : "Belum ada aktivitas";
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>User Dossier</DialogTitle>
          <DialogDescription>Ringkasan profil dan aktivitas pengguna di platform.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-36 animate-pulse rounded-[1.5rem] bg-slate-100" />
            <div className="grid gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : !user ? (
          <EmptyState icon={UserRound} title="Pengguna tidak ditemukan" />
        ) : (
          <div className="space-y-6 py-2">
            <section className="rounded-[1.75rem] border border-explore/20 bg-explore-container p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-2xl font-black text-explore ring-1 ring-orange-200">
                    {getInitial(user.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-black text-slate-950">{user.name}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Mail className="h-4 w-4 text-ai" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <RoleBadge role={user.role} />
                      <StatusBadge status={user.status} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">
                        <Calendar className="h-3.5 w-3.5" />
                        Bergabung {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/80 bg-white/80 p-4 md:w-56">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-explore">
                    Aktivitas terakhir
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-slate-900">{latestActivity}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-4">
              <OverviewCard icon={Star} label="Ulasan" value={tabCounts.reviews} tone="orange" />
              <OverviewCard icon={Heart} label="Favorit" value={tabCounts.favorites} tone="rose" />
              <OverviewCard icon={Search} label="Pencarian" value={tabCounts.searches} tone="blue" />
              <OverviewCard
                icon={Shield}
                label="Status"
                value={user.status === "active" ? "Aktif" : "Suspend"}
                tone={user.status === "active" ? "emerald" : "rose"}
              />
            </section>

            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
              <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition ${
                        isActive
                          ? "bg-explore text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isActive ? "bg-white/20 text-white" : "bg-white text-slate-500"
                        }`}
                      >
                        {tabCounts[tab.key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 md:p-5">
                {activeTab === "reviews" && (
                  <div className="space-y-3">
                    {user.userReviews.length === 0 ? (
                      <EmptyState icon={Star} title="Belum ada ulasan" />
                    ) : (
                      user.userReviews.map((review) => (
                        <article key={review.id} className="rounded-3xl border border-slate-200 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-black text-slate-950">
                                {review.destination?.name || "Destinasi"}
                              </h4>
                              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />
                                {review.destination?.city || "-"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-4 w-4 ${
                                    index < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.reviewText && (
                            <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-slate-600">
                              {review.reviewText}
                            </p>
                          )}
                          <p className="mt-3 text-xs font-bold text-slate-400">
                            {formatDate(review.createdAt)}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "favorites" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {user.favorites.length === 0 ? (
                      <div className="md:col-span-2">
                        <EmptyState icon={Heart} title="Belum ada destinasi favorit" />
                      </div>
                    ) : (
                      user.favorites.map((favorite) => {
                        const imageUrl = normalizeImageUrl(favorite.destination?.thumbnailUrl);
                        return (
                          <article
                            key={favorite.id}
                            className="flex gap-3 rounded-3xl border border-slate-200 p-3"
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={favorite.destination.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              ) : (
                                <MapPin className="m-5 h-6 w-6 text-slate-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-black text-slate-950">
                                {favorite.destination?.name || "Destinasi"}
                              </h4>
                              <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                                {favorite.destination?.city}, {favorite.destination?.province}
                              </p>
                              <p className="mt-2 text-xs font-bold text-explore">
                                Disimpan {formatDate(favorite.createdAt)}
                              </p>
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === "searches" && (
                  <div className="space-y-2">
                    {user.searchLogs.length === 0 ? (
                      <EmptyState icon={Search} title="Belum ada riwayat pencarian" />
                    ) : (
                      user.searchLogs.map((log) => (
                        <article
                          key={log.id}
                          className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 px-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-ai">
                            <Search className="h-4 w-4" />
                          </div>
                          <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-800">
                            {log.keyword}
                          </p>
                          <p className="shrink-0 text-xs font-bold text-slate-400">
                            {formatDate(log.createdAt, true)}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className="flex justify-end">
              <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: "orange" | "rose" | "blue" | "emerald";
}) {
  const toneClass = {
    orange: "bg-orange-50 text-explore",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-sky-50 text-ai",
    emerald: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: AdminUserDetail["role"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
        role === "ADMIN"
          ? "bg-orange-50 text-explore ring-1 ring-orange-200"
          : "bg-sky-50 text-ai ring-1 ring-sky-200"
      }`}
    >
      <Shield className="h-3.5 w-3.5" />
      {role === "ADMIN" ? "Admin" : "User"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      }`}
    >
      {active ? "Aktif" : "Ditangguhkan"}
    </span>
  );
}

function EmptyState({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-extrabold text-slate-700">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Aktivitas akan muncul otomatis setelah pengguna memakai fitur terkait.
      </p>
    </div>
  );
}
