import { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/admin/dashboard/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | VibeTravel',
  description: 'High-level insights and system status across all VibeTravel destinations.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
