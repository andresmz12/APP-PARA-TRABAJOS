'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: NavItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  // El link activo es el que tiene el href más largo que coincida con el pathname actual.
  // Esto evita que el link raíz (ej: /candidato) quede activo cuando estás en /candidato/mis-aplicaciones.
  const bestMatch = items
    .filter(({ href }) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-3.5rem)]">
        <nav className="p-3 flex flex-col gap-0.5">
          {items.map(({ href, label, icon }) => {
            const active = href === bestMatch;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 flex">
        {items.map(({ href, label, icon }) => {
          const active = href === bestMatch;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-blue-700' : 'text-slate-500'
              )}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
