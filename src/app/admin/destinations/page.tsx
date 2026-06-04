import React from "react";
import { DestinationsTable } from "@/components/admin/destinations/destinations-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Destinasi - Admin Dashboard",
  description: "Kelola data master destinasi wisata",
};

type AdminDestinationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDestinationsPage({ searchParams }: AdminDestinationsPageProps) {
  const params = searchParams ? await searchParams : {};
  const initialFilters = {
    search: getParamValue(params.search) || "",
    page: Number(getParamValue(params.page) || 1),
    city: getParamValue(params.city) || "all",
    quality: getParamValue(params.quality) || "all",
    sort: getParamValue(params.sort) || "newest",
    rating: getParamValue(params.rating) || "all",
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            Admin Workspace
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Destinasi Wisata
          </h2>
          <p className="max-w-3xl text-sm text-slate-600">
            Kelola kualitas data destinasi, media, lokasi, dan tindakan operasional dari satu halaman.
          </p>
        </div>
      </div>

      <DestinationsTable initialFilters={initialFilters} />
    </div>
  );
}

