import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminGate from '@/components/layout/AdminGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="flex min-h-screen bg-ivory">
        <AdminSidebar />
        <div className="flex-1 md:ml-64">
          {children}
        </div>
      </div>
    </AdminGate>
  );
}
