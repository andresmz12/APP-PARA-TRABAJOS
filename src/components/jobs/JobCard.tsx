'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MapPin, Clock, DollarSign, CheckCircle2, Building2 } from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';
import { JOB_AREAS, type Job } from '@/lib/types';

interface JobCardProps {
  job: Job & {
    company_nombre?: string;
    company_verificada?: boolean;
    company_ciudad?: string;
  };
  hasApplied?: boolean;
  hasProfile?: boolean;
  onApplied?: () => void;
}

export default function JobCard({ job, hasApplied = false, hasProfile = false, onApplied }: JobCardProps) {
  const [applied, setApplied] = useState(hasApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    if (!hasProfile) {
      setError('Completa tu perfil antes de aplicar.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase
      .from('applications')
      .insert({ job_id: job.id, candidate_id: user.id });

    if (insertError) {
      setError('No se pudo aplicar. Intenta de nuevo.');
    } else {
      setApplied(true);
      onApplied?.();
    }
    setLoading(false);
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base leading-tight">{job.titulo}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 truncate">
                {job.company_nombre ?? job.company?.nombre}
              </span>
              {(job.company_verificada ?? job.company?.verificada) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" title="Empresa verificada" />
              )}
            </div>
          </div>
          <Badge variant="info">{JOB_AREAS[job.area]}</Badge>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {job.ubicacion}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {job.horario}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {formatSalary(job.salario_min, job.salario_max)}
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-slate-600 line-clamp-2">{job.descripcion}</p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400">{timeAgo(job.created_at)}</span>
          <div className="flex flex-col items-end gap-1">
            {error && <p className="text-xs text-red-600">{error}</p>}
            {applied ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Aplicación enviada
              </span>
            ) : (
              <Button size="sm" onClick={handleApply} loading={loading}>
                Aplicar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
