import React from 'react';
import { TopicsClient } from '@/components/admin/topics/TopicsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manajemen Topik - Admin Dashboard',
  description: 'Kelola topik analisis ulasan pariwisata yang dihasilkan oleh BIRCH clustering',
};

export default function AdminTopicsPage() {
  return (
    <div className="flex-1 bg-slate-50/60 p-4 pt-6 md:p-8">
      <TopicsClient />
    </div>
  );
}

