import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layouts/Navbar';
import Sidebar from '@/components/layouts/Sidebar';
import { Search, ClipboardList, User } from 'lucide-react';

const navItems = [
  { href: '/candidato', label: 'Empleos', icon: Search },
  { href: '/candidato/mis-aplicaciones', label: 'Mis aplicaciones', icon: ClipboardList },
  { href: '/candidato/perfil', label: 'Mi perfil', icon: User },
];

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'candidato') redirect('/redirect');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role="candidato" email={profile.email} />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 max-w-3xl">{children}</main>
      </div>
    </div>
  );
}
