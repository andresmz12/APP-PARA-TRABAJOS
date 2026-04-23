import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { JobStatusBadge, Badge } from '@/components/ui/Badge';
import { MapPin, Briefcase } from 'lucide-react';
import { JOB_AREAS, type Job } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default async function AdminEmpleosPage() {
  const supabase = createClient();

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, company:companies(nombre, verificada)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Todos los empleos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {jobs?.length ?? 0} vacantes registradas en la plataforma.
        </p>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card className="text-center py-10">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Aún no hay vacantes publicadas.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job: Job & { company: { nombre: string; verificada: boolean } }) => (
            <Card key={job.id}>
              <div className="flex items-start justify-between gap-3">
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
