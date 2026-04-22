'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { JOB_AREAS, type JobArea } from '@/lib/types';
import { Search } from 'lucide-react';

export default function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const area = searchParams.get('area') ?? '';
  const q = searchParams.get('q') ?? '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const areaOptions = [
    { value: '', label: 'Todas las áreas' },
    ...Object.entries(JOB_AREAS).map(([value, label]) => ({
      value: value as JobArea,
      label,
    })),
  ];

  return (
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
      <Select
        options={areaOptions}
        value={area}
        onChange={(e) => updateFilter('area', e.target.value)}
        className="sm:w-52"
      />
    </div>
  );
}
