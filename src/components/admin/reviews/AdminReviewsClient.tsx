'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminDestinationService } from '@/services/admin/destination.service';
import { Loader2 } from 'lucide-react';
import { ReviewsTable } from './ReviewsTable';
import { DestinationAnalytics } from './DestinationAnalytics';

export function AdminReviewsClient() {
    const [selectedDestinationId, setSelectedDestinationId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'analytics' | 'reviews'>('reviews');

    // Fetch destinations for dropdown
    const { data: destinationsData, isLoading: loadingDestinations } = useQuery({
        queryKey: ['admin-destinations-all'],
        queryFn: () => adminDestinationService.getDestinations({ limit: 100 }), // Get max possible for select
    });

    const destinations = destinationsData?.data || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-full sm:w-1/3">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Pilih Destinasi</label>
                    {loadingDestinations ? (
                        <div className="flex items-center space-x-2 text-sm text-slate-500 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Memuat destinasi...</span>
                        </div>
                    ) : (
                        <select
                            className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={selectedDestinationId || ''}
                            onChange={(e) => setSelectedDestinationId(Number(e.target.value) || null)}
                        >
                            <option value="" disabled>-- Pilih Destinasi --</option>
                            {destinations.map((dest: any) => (
                                <option key={dest.id} value={dest.id}>
                                    {dest.name} ({dest.city})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedDestinationId && (
                    <div className="w-full sm:w-auto flex bg-slate-100 p-1 rounded-lg self-end mt-auto">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'reviews' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Daftar Review
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'analytics' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Analisis Sentimen & Topik
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {!selectedDestinationId ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🗺️</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Belum Ada Destinasi Terpilih</h3>
                    <p className="text-slate-500 max-w-md text-center">
                        Silakan pilih destinasi dari dropdown di atas untuk mulai melihat dan mengelola review serta hasil analisisnya.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                    {activeTab === 'reviews' && <ReviewsTable destinationId={selectedDestinationId} />}
                    {activeTab === 'analytics' && <DestinationAnalytics destinationId={selectedDestinationId} />}
                </div>
            )}
        </div>
    );
}
