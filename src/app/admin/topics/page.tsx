import React from 'react';
import { TopicsClient } from '@/components/admin/topics/TopicsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manajemen Topik - Admin Dashboard',
  description: 'Kelola topik analisis ulasan pariwisata yang dihasilkan oleh BIRCH clustering',
};

export default function AdminTopicsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Topik</h2>
        <p className="text-muted-foreground mt-1">
          Kelola topik analisis ulasan yang dihasilkan model BIRCH clustering.
        </p>
      </div>

      <div className="mt-6">
        <TopicsClient />
      </div>
    </div>
  );
}
