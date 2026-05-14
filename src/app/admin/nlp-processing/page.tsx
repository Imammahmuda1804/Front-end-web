import React from "react";
import NlpProcessingClient from "@/components/admin/nlp/NlpProcessingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NLP Processing - Admin Dashboard",
  description:
    "Upload file hasil scraping dan jalankan pipeline NLP untuk analisis sentimen dan topik",
};

export default function NlpProcessingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">NLP Processing</h2>
      </div>

      <p className="text-muted-foreground">
        Upload file Excel hasil scraping, lalu sistem akan menganalisis
        sentimen, topik, dan embedding secara otomatis.
      </p>

      <div className="mt-6">
        <NlpProcessingClient />
      </div>
    </div>
  );
}
