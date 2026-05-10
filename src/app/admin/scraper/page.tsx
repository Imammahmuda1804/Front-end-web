import React from "react";
import ScraperClient from "@/components/admin/scraper/ScraperClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scraper Management - Admin Dashboard",
  description: "Monitor and manage review scraping and NLP processing pipeline",
};

export default function AdminScraperPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Engine Room</h2>
      </div>
      
      <p className="text-muted-foreground">
        Review Scraper & NLP Pipeline Control
      </p>

      <div className="mt-6">
        <ScraperClient />
      </div>
    </div>
  );
}
