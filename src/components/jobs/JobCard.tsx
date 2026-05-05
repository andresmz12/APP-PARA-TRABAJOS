'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MapPin, Clock, DollarSign, CheckCircle2, Building2, Wifi, Users, ListChecks } from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';
import { JOB_AREAS, type Job } from '@/lib/types';

interface JobCardProps {
  job: Job & {
    company_nombre?: string;
    company_verificada?: boolean;
    company_ciudad?: string;
    company_telefono?: string;
  };
  hasApplied?: boolean;
  hasProfile?: boolean;
  onApplied?: () => void;
}

const MODALIDAD_LABELS: Record<string, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

export default function JobCard({ job, hasApplied = false, hasProfile = false, onApplied }: JobCardProps) {
  const [applied, setApplied] = useState(hasApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    if (!hasProfile) { setError('Completa tu perfil antes de aplicar.'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: job.id }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'No se pudo aplicar. Intenta de nuevo.');
    } else {
      setApplied(true);
      onApplied?.();
    }
    setLoading(false);
  }

  const isVerified = job.company_verificada ?? job.company?.verificada;
  const companyName = job.company_nombre ?? job.company?.nombre;
  const salary = formatSalary(job.salario_min, job.salario_max);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base leading-tight">{job.titulo}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 truncate">{companyName}</span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Verificada
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="info">{JOB_AREAS[job.area]}</Badge>
            {job.modalidad && job.modalidad !== 'presencial' && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                <Wifi className="w-3 h-3" />
                {MODALIDAD_LABELS[job.modalidad] ?? job.modalidad}
              </span>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {job.ubicacion && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.ubicacion}</span>}
          {job.horario && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.horario}</span>}
          {salary !== 'No especificado' && <span className="flex items-center gap-1 font-medium text-green-700"><DollarSign className="w-3.5 h-3.5" /> {salary}</span>}
          {job.requisitos?.length > 0 && (
            <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {job.requisitos.length} requisito{job.requisitos.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Descripción */}
        <p className="text-sm text-slate-600 line-clamp-2">{job.descripcion}</p>

        {/* Requisitos (si hay pocos, mostrarlos) */}
        {job.requisitos?.length > 0 && job.requisitos.length <= 3 && (
          <div className="flex flex-wrap gap-1.5">
            {job.requisitos.map((r, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> {r}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400">{timeAgo(job.created_at)}</span>
          <div className="flex flex-col items-end gap-1">
            {error && <p className="text-xs text-red-600">{error}</p>}
            {applied ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle2 className="w-4 h-4" /> Aplicación enviada
              </span>
            ) : (
              <Button size="sm" onClick={handleApply} loading={loading}>
                Aplicar ahora
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
