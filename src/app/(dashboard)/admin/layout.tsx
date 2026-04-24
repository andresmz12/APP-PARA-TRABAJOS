import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/layouts/Navbar';
import Sidebar from '@/components/layouts/Sidebar';
import { Building2, LayoutDashboard, Briefcase } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Panel', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
  { href: '/admin/empresas', label: 'Empresas', icon: <Building2 className="w-4 h-4 shrink-0" /> },
  { href: '/admin/empleos', label: 'Empleos', icon: <Briefcase className="w-4 h-4 shrink-0" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'admin') redirect('/redirect');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="admin" email={session.user.email} />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}
