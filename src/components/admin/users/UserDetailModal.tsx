"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { adminUserService, AdminUserDetail } from "@/services/admin/user.service";
import {
  Star,
  Heart,
  Search,
  MapPin,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";

interface UserDetailModalProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabKey = "reviews" | "favorites" | "searches";

export function UserDetailModal({ userId, open, onOpenChange }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("reviews");

  const { data: user, isLoading } = useQuery<AdminUserDetail>({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => adminUserService.getUserDetail(userId!),
    enabled: open && userId !== null,
  });

  const tabs: { key: TabKey; label: string; icon: React.ElementType; count: number }[] = [
    { key: "reviews", label: "Ulasan", icon: Star, count: user?.userReviews?.length || 0 },
    { key: "favorites", label: "Favorit", icon: Heart, count: user?.favorites?.length || 0 },
    { key: "searches", label: "Pencarian", icon: Search, count: user?.searchLogs?.length || 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pengguna</DialogTitle>
          <DialogDescription>Informasi dan aktivitas pengguna di platform</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Memuat data...</div>
        ) : !user ? (
          <div className="py-12 text-center text-muted-foreground">Pengguna tidak ditemukan</div>
        ) : (
          <div className="space-y-6 py-2">
            {/* User Profile Header */}
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate">{user.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {user.status === "active" ? "Aktif" : "Ditangguhkan"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span className="ml-1 text-xs bg-muted rounded-full px-1.5 py-0.5">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-3">
                  {user.userReviews.length === 0 ? (
                    <EmptyState message="Belum ada ulasan" />
                  ) : (
                    user.userReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {review.destination?.name || "Destinasi"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {review.destination?.city || "-"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.reviewText && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {review.reviewText}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {new Date(review.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === "favorites" && (
                <div className="space-y-3">
                  {user.favorites.length === 0 ? (
                    <EmptyState message="Belum ada favorit" />
                  ) : (
                    user.favorites.map((fav) => (
                      <div
                        key={fav.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {fav.destination?.thumbnailUrl ? (
                            <img
                              src={fav.destination.thumbnailUrl}
                              alt={fav.destination.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {fav.destination?.name || "Destinasi"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {fav.destination?.city}, {fav.destination?.province}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {new Date(fav.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Search History Tab */}
              {activeTab === "searches" && (
                <div className="space-y-2">
                  {user.searchLogs.length === 0 ? (
                    <EmptyState message="Belum ada riwayat pencarian" />
                  ) : (
                    user.searchLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm flex-1 truncate">{log.keyword}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-muted-foreground text-sm">
      {message}
    </div>
  );
}
