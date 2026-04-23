import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge, JobStatusBadge } from '@/components/ui/Badge';
import { PlusCircle, MapPin, Clock, Briefcase } from 'lucide-react';
import { JOB_AREAS, type Job } from '@/lib/types';
import { formatSalary, timeAgo } from '@/lib/utils';
import VacanteActions from './VacanteActions';

export default async function EmpresaVacantesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const company = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM companies WHERE owner_id = $1',
    [session.user.id]
  );
  if (!company) redirect('/empresa/perfil');

  const jobs = await query<Job>(
    'SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC',
    [company.id]
  );
  const canPost = company.status === 'aprobada';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mis vacantes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {jobs.length} vacante{jobs.length !== 1 ? 's' : ''} publicada{jobs.length !== 1 ? 's' : ''}.
          </p>
        </div>
        {canPost ? (
          <Link
            href="/empresa/vacantes/nueva"
            className="flex items-center gap-2 bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva vacante
          </Link>
        ) : (
          <span className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            Empresa pendiente de aprobación
          </span>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-700">Aún no tienes vacantes</p>
          <p className="text-sm text-slate-400 mt-1">
            {canPost
              ? 'Crea tu primera vacante para empezar a recibir candidatos.'
              : 'Espera la aprobación de tu empresa para publicar vacantes.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{job.titulo}</span>
                    <JobStatusBadge status={job.status} />
                    <Badge variant="info">{JOB_AREAS[job.area]}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{job.cargo}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.ubicacion}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.horario}</span>
                    <span>{formatSalary(job.salario_min, job.salario_max)}</span>
                    <span>Publicada {timeAgo(job.created_at)}</span>
                  </div>
                </div>
                <VacanteActions jobId={job.id} status={job.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
