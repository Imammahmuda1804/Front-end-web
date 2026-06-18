import React from "react";
import { NlpProcessingClient } from "@/features/topics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NLP Processing - Admin Dashboard",
  description:
    "Upload file hasil scraping dan jalankan pipeline NLP untuk analisis sentimen dan topik",
};

export default function NlpProcessingPage() {
  return (
    <div className="flex-1 bg-slate-50/60 p-4 pt-6 md:p-8">
      <NlpProcessingClient />
    </div>
  );
}

