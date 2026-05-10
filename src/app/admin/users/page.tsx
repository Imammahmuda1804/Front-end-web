import React from "react";
import { UsersClient } from "@/components/admin/users/UsersClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Pengguna - Admin Dashboard",
  description: "Kelola akun pengguna, role, dan status",
};

export default function AdminUsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
          <p className="text-muted-foreground mt-1">
            Kelola akun pengguna, role, dan aktivitas platform.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <UsersClient />
      </div>
    </div>
  );
}
