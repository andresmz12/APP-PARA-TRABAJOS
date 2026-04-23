import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/layouts/Navbar';
import Sidebar from '@/components/layouts/Sidebar';
import { LayoutDashboard, Briefcase, Users, Building2 } from 'lucide-react';

const navItems = [
  { href: '/empresa', label: 'Inicio', icon: LayoutDashboard },
  { href: '/empresa/vacantes', label: 'Vacantes', icon: Briefcase },
  { href: '/empresa/aplicaciones', label: 'Aplicaciones', icon: Users },
  { href: '/empresa/perfil', label: 'Mi Empresa', icon: Building2 },
];

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'empresa') redirect('/redirect');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="empresa" email={session.user.email} />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}
