'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { JobStatusBadge, Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MapPin, Briefcase, PauseCircle, PlayCircle, Trash2, XCircle } from 'lucide-react';
import { JOB_AREAS, type Job, type Company, type JobStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type AdminJob = Job & { company: Pick<Company, 'nombre' | 'verificada'> };

export default function AdminEmpleosPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<JobStatus | 'todas'>('todas');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/jobs');
    const data = await res.json();
    let list: AdminJob[] = data.jobs ?? [];
    if (filter !== 'todas') list = list.filter((j) => j.status === filter);
    setJobs(list);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function setStatus(id: string, status: JobStatus) {
    await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchJobs();
  }

  async function deleteJob(id: string) {
    if (!confirm('¿Eliminar esta vacante? Esta acción no se puede deshacer.')) return;
    await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    fetchJobs();
  }

  const filters: { value: JobStatus | 'todas'; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'activa', label: 'Activas' },
    { value: 'pausada', label: 'Pausadas' },
    { value: 'cerrada', label: 'Cerradas' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Todos los empleos</h1>
        <p className="text-sm text-slate-500 mt-0.5">{jobs.length} vacantes.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === value ? 'bg-blue-700 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-10">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No hay vacantes en esta categoría.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{job.titulo}</span>
                    <JobStatusBadge status={job.status} />
                    <Badge variant="info">{JOB_AREAS[job.area]}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.company?.nombre ?? '—'}
                    {' · '}
                    <MapPin className="w-3 h-3 inline" /> {job.ubicacion}
                    {' · '}
                    {formatDate(job.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {job.status === 'activa' && (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(job.id, 'pausada')}>
                      <PauseCircle className="w-3.5 h-3.5" /> Pausar
                    </Button>
                  )}
                  {job.status === 'pausada' && (
                    <Button size="sm" variant="primary" onClick={() => setStatus(job.id, 'activa')}>
                      <PlayCircle className="w-3.5 h-3.5" /> Activar
                    </Button>
                  )}
                  {job.status !== 'cerrada' && (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(job.id, 'cerrada')}>
                      <XCircle className="w-3.5 h-3.5" /> Cerrar
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deleteJob(job.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
