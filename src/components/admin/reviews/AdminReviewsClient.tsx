'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, ListChecks, Loader2, MapPin, MessageSquareText } from 'lucide-react';

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { AdminDestination, adminDestinationService } from '@/services/admin/destination.service';

import { DestinationAnalytics } from './DestinationAnalytics';
import { ReviewsTable } from './ReviewsTable';

export type ReviewWorkspaceFilters = {
    destinationId: number | null;
    tab: string;
    page: number;
    sentiment: string;
    nlpStatus: string;
    dateFrom: string;
    dateTo: string;
    sort: string;
    topicId: string;
    query: string;
};

type AdminReviewsClientProps = {
    initialFilters: ReviewWorkspaceFilters;
};

type ReviewTab = 'reviews' | 'analytics';

function isReviewTab(value: string | null): value is ReviewTab {
    return value === 'reviews' || value === 'analytics';
}

// Mengatur tab review admin dan sinkronisasi filter ke URL.
export function AdminReviewsClient({ initialFilters }: AdminReviewsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedDestinationId = Number(searchParams.get('destinationId') || initialFilters.destinationId || 0) || null;
    const activeTab = isReviewTab(searchParams.get('tab') || initialFilters.tab)
        ? ((searchParams.get('tab') || initialFilters.tab) as ReviewTab)
        : 'reviews';

    const { data: destinationsData, isLoading: loadingDestinations } = useQuery({
        queryKey: ['admin-destinations-all'],
        queryFn: () => adminDestinationService.getDestinations({ limit: 100 }),
    });

    const destinations = React.useMemo(() => destinationsData?.data || [], [destinationsData?.data]);
    const selectedDestination = destinations.find((destination) => destination.id === selectedDestinationId);

    const destinationOptions = React.useMemo<NativeSelectOption[]>(
        () => [
            { value: '', label: 'Pilih destinasi', description: 'Pilih dulu untuk melihat review' },
            ...destinations.map((destination: AdminDestination) => ({
                value: String(destination.id),
                label: destination.name,
                description: destination.city,
            })),
        ],
        [destinations],
    );

    const updateQuery = React.useCallback(
        (updates: Record<string, string | number | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (
                    value === null ||
                    value === '' ||
                    value === 'all' ||
                    (key === 'page' && Number(value) === 1) ||
                    (key === 'tab' && value === 'reviews')
                ) {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            });
            const next = params.toString();
            router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams],
    );

    const handleDestinationChange = (value: string) => {
        updateQuery({
            destinationId: value,
            tab: 'reviews',
            page: 1,
            sentiment: '',
            nlp_status: 'all',
            date_from: '',
            date_to: '',
            topic_id: '',
            query: '',
        });
    };

    return (
        <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="w-full lg:max-w-md">
                        <label className="mb-2 block text-sm font-semibold text-slate-800">Destinasi aktif</label>
                        {loadingDestinations ? (
                            <div className="flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat destinasi...
                            </div>
                        ) : (
                            <NativeSelect
                                aria-label="Pilih destinasi untuk review admin"
                                value={selectedDestinationId ? String(selectedDestinationId) : ''}
                                options={destinationOptions}
                                onValueChange={handleDestinationChange}
                                leftIcon={<MapPin className="h-4 w-4" />}
                                searchable
                                searchPlaceholder="Cari nama destinasi..."
                            />
                        )}
                    </div>

                    {selectedDestinationId && (
                        <div className="flex w-full flex-col gap-2 lg:w-auto">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Mode kerja
                            </p>
                            <div className="grid rounded-xl bg-slate-100 p-1 sm:grid-cols-2" role="tablist" aria-label="Mode manajemen review">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === 'reviews' ? 'true' : 'false'}
                                    onClick={() => updateQuery({ tab: 'reviews' })}
                                    className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
                                        activeTab === 'reviews'
                                            ? 'bg-white text-slate-950 shadow-sm shadow-slate-200'
                                            : 'text-slate-600 hover:text-slate-950'
                                    }`}
                                >
                                    <ListChecks className="h-4 w-4" />
                                    Daftar Review
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === 'analytics' ? 'true' : 'false'}
                                    onClick={() => updateQuery({ tab: 'analytics' })}
                                    className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
                                        activeTab === 'analytics'
                                            ? 'bg-white text-slate-950 shadow-sm shadow-slate-200'
                                            : 'text-slate-600 hover:text-slate-950'
                                    }`}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Analitik
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {selectedDestination && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        Review workspace untuk <span className="font-semibold text-slate-900">{selectedDestination.name}</span>, {selectedDestination.city}. Filter dan tab disimpan di URL.
                    </div>
                )}
            </section>

            {!selectedDestinationId ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                        <MessageSquareText className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">Pilih destinasi untuk mulai moderasi</h3>
                    <p className="mt-2 max-w-md text-sm text-slate-500">
                        Setelah destinasi dipilih, admin bisa melihat health summary, review prioritas, tabel moderasi, dan analitik sentimen.
                    </p>
                </div>
            ) : activeTab === 'reviews' ? (
                <ReviewsTable destinationId={selectedDestinationId} />
            ) : (
                <DestinationAnalytics destinationId={selectedDestinationId} />
            )}
        </div>
    );
}

