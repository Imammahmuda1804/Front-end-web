import { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/admin/dashboard/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | RANAHINSIGHT',
  description: 'Ringkasan insight dan status sistem untuk seluruh destinasi RANAHINSIGHT.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
