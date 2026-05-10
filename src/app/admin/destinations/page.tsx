import React from "react";
import { DestinationsTable } from "@/components/admin/destinations/destinations-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Destinasi - Admin Dashboard",
  description: "Kelola data master destinasi wisata",
};

export default function AdminDestinationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Destinasi Wisata</h2>
      </div>
      
      <p className="text-muted-foreground">
        Kelola semua data destinasi, lokasi, dan galeri yang akan ditampilkan kepada pengguna.
      </p>

      <div className="mt-6">
        <DestinationsTable />
      </div>
    </div>
  );
}
