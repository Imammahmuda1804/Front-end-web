import { Metadata } from 'next';
import { AdminSingleAnalysisClient } from '@/components/admin/compare/AdminSingleAnalysisClient';

export const metadata: Metadata = {
  title: 'Analitik Detail Destinasi | RANAHINSIGHT Admin',
  description: 'Analisis detail satu destinasi untuk kebutuhan monitoring dan keputusan dinas pariwisata.',
};

export default function AdminDetailAnalyticsPage() {
  return (
    <div className="flex-1 w-full">
      <AdminSingleAnalysisClient />
    </div>
  );
}
