'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';
import { LogOut, Briefcase } from 'lucide-react';

interface NavbarProps {
  role: UserRole;
  email: string;
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Super Admin',
  empresa: 'Empresa',
  candidato: 'Candidato',
};

const roleHome: Record<UserRole, string> = {
  admin: '/admin',
  empresa: '/empresa',
  candidato: '/candidato',
};

export default function Navbar({ role, email }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href={roleHome[role]}
          className="flex items-center gap-2 font-bold text-slate-900 text-base shrink-0"
        >
          <Briefcase className="w-5 h-5 text-blue-700" />
          <span className="hidden sm:block">App Para Trabajos</span>
          <span className="sm:hidden">APT</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-xs text-slate-500">{email}</span>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              {roleLabels[role]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
