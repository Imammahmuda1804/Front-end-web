import React from 'react';
import { TopicsClient } from '@/features/topics';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manajemen Topik - Admin Dashboard',
  description: 'Kelola topik analisis ulasan pariwisata yang dihasilkan oleh BIRCH clustering',
};

export default function AdminTopicsPage() {
  return (
    <main className="flex-1 bg-slate-50 p-4 pt-6 md:p-8 dark:bg-slate-950">
      <TopicsClient />
    </main>
  );
}

