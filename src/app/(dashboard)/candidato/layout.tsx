import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/layouts/Navbar';
import Sidebar from '@/components/layouts/Sidebar';
import { Search, ClipboardList, User } from 'lucide-react';

const navItems = [
  { href: '/candidato', label: 'Empleos', icon: <Search className="w-4 h-4 shrink-0" /> },
  { href: '/candidato/mis-aplicaciones', label: 'Mis aplicaciones', icon: <ClipboardList className="w-4 h-4 shrink-0" /> },
  { href: '/candidato/perfil', label: 'Mi perfil', icon: <User className="w-4 h-4 shrink-0" /> },
];

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'candidato') redirect('/redirect');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="candidato" email={session.user.email} />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 max-w-3xl">{children}</main>
      </div>
    </div>
  );
}
