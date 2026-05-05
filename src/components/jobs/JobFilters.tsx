'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import Select from '@/components/ui/Select';
import { JOB_AREAS, type JobArea } from '@/lib/types';
import { Search, BadgeCheck } from 'lucide-react';

const modalidadOptions = [
  { value: '', label: 'Cualquier modalidad' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
];

export default function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const area = searchParams.get('area') ?? '';
  const q = searchParams.get('q') ?? '';
  const modalidad = searchParams.get('modalidad') ?? '';
  const verificada = searchParams.get('verificada') ?? '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set(key, value); } else { params.delete(key); }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const areaOptions = [
    { value: '', label: 'Todas las áreas' },
    ...Object.entries(JOB_AREAS).map(([value, label]) => ({ value: value as JobArea, label })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por título, cargo o ciudad..."
            defaultValue={q}
            onChange={(e) => updateFilter('q', e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
          />
        </div>
        <Select options={areaOptions} value={area} onChange={(e) => updateFilter('area', e.target.value)} className="sm:w-48" />
        <Select options={modalidadOptions} value={modalidad} onChange={(e) => updateFilter('modalidad', e.target.value)} className="sm:w-44" />
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={verificada === '1'}
          onChange={(e) => updateFilter('verificada', e.target.checked ? '1' : '')}
          className="rounded border-slate-300 text-blue-700 focus:ring-blue-700"
        />
        <BadgeCheck className="w-4 h-4 text-green-500" />
        <span className="text-sm text-slate-600">Solo empresas verificadas</span>
      </label>
    </div>
  );
}
