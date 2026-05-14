import React from 'react';
import { Metadata } from 'next';
import { AdminReviewsClient } from '@/components/admin/reviews/AdminReviewsClient';

export const metadata: Metadata = {
    title: 'Manajemen Review & Analisis - Admin Dashboard',
    description: 'Kelola review dan lihat hasil analisis sentimen destinasi wisata',
};

export default function AdminReviewsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Review & Analisis</h2>
            </div>

            <p className="text-muted-foreground">
                Kelola data review yang telah di-scrape dan lihat hasil visualisasi analisis sentimen serta topik berdasarkan destinasi.
            </p>

            <div className="mt-6">
                <AdminReviewsClient />
            </div>
        </div>
    );
}
