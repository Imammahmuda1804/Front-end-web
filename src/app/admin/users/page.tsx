import React from "react";
import { UsersClient } from "@/features/admin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Pengguna - Admin Dashboard",
  description: "Kelola akun pengguna, role, dan status",
};

export default function AdminUsersPage() {
  return (
    <div className="flex-1 bg-slate-50/60 p-4 pt-6 md:p-8">
      <UsersClient />
    </div>
  );
}

