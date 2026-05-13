import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopbar } from '@/components/layout/AdminTopbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AdminTopbar />
        <main className="flex-1 p-6 lg:p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
