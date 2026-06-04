import React from "react";
import ScraperClient from "@/components/admin/scraper/ScraperClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scraper Management - Admin Dashboard",
  description: "Monitor and manage review scraping and NLP processing pipeline",
};

export default function AdminScraperPage() {
  return (
    <div className="flex-1 bg-slate-50/60 p-4 pt-6 md:p-8">
      <ScraperClient />
    </div>
  );
}

