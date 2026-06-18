import React from 'react';
import { Metadata } from 'next';
import { AdminReviewsClient } from '@/features/admin';

export const metadata: Metadata = {
    title: 'Manajemen Review & Analisis - Admin Dashboard',
    description: 'Kelola review dan lihat hasil analisis sentimen destinasi wisata',
};

type AdminReviewsPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
    const params = searchParams ? await searchParams : {};
    const initialFilters = {
        destinationId: Number(getParamValue(params.destinationId) || 0) || null,
        tab: getParamValue(params.tab) || 'reviews',
        page: Number(getParamValue(params.page) || 1),
        sentiment: getParamValue(params.sentiment) || '',
        nlpStatus: getParamValue(params.nlp_status) || 'all',
        dateFrom: getParamValue(params.date_from) || '',
        dateTo: getParamValue(params.date_to) || '',
        sort: getParamValue(params.sort) || 'newest',
        topicId: getParamValue(params.topic_id) || '',
        query: getParamValue(params.query) || '',
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                        Admin Moderation
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                        Manajemen Review & Analisis
                    </h2>
                    <p className="max-w-3xl text-sm text-slate-600">
                        Kelola review hasil scraping, pahami prioritas moderasi, dan baca analitik sentimen per destinasi.
                    </p>
                </div>
            </div>

            <AdminReviewsClient initialFilters={initialFilters} />
        </div>
    );
}

