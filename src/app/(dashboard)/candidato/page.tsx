import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import { Briefcase } from 'lucide-react';
import type { Job, JobArea, Company } from '@/lib/types';
import { Suspense } from 'react';

interface PageProps {
  searchParams: { area?: string; q?: string };
}

async function JobList({ userId, searchParams }: { userId: string; searchParams: PageProps['searchParams'] }) {
  const params: unknown[] = ['activa', 'aprobada'];
  const conditions: string[] = ['j.status = $1', 'c.status = $2'];
  let idx = 3;

  if (searchParams.area) {
    conditions.push(`j.area = $${idx++}`);
    params.push(searchParams.area as JobArea);
  }
  if (searchParams.q) {
    conditions.push(`(j.titulo ILIKE $${idx} OR j.cargo ILIKE $${idx} OR j.ubicacion ILIKE $${idx})`);
    params.push(`%${searchParams.q}%`);
    idx++;
  }

  const jobs = await query<Job & { company_nombre: string; company_verificada: boolean; company_ciudad: string }>(
    `SELECT j.*,
       c.nombre AS company_nombre,
       c.verificada AS company_verificada,
       c.ciudad AS company_ciudad
     FROM jobs j JOIN companies c ON c.id = j.company_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY j.created_at DESC`,
    params
  );

  const appliedRows = await query<{ job_id: string }>(
    'SELECT job_id FROM applications WHERE candidate_id = $1',
    [userId]
  );
  const appliedJobIds = new Set(appliedRows.map((r) => r.job_id));

  const candidateProfile = await queryOne(
    'SELECT id FROM candidate_profiles WHERE id = $1',
    [userId]
  );
  const hasProfile = !!candidateProfile;

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="font-medium text-slate-700">No hay vacantes disponibles</p>
        <p className="text-sm text-slate-400 mt-1">Intenta con otros filtros o revisa más tarde.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          hasApplied={appliedJobIds.has(job.id)}
          hasProfile={hasProfile}
        />
      ))}
    </div>
  );
}

export default async function CandidatoFeedPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const candidateProfile = await queryOne(
    'SELECT id FROM candidate_profiles WHERE id = $1',
    [session.user.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Empleos disponibles</h1>
        <p className="text-sm text-slate-500 mt-0.5">Encuentra tu próxima oportunidad laboral.</p>
      </div>

      {!candidateProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="shrink-0 text-amber-500 mt-0.5">⚠️</div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Completa tu perfil para aplicar</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Necesitas crear tu perfil antes de poder aplicar a vacantes.{' '}
              <a href="/candidato/perfil" className="underline font-medium">Ir a mi perfil →</a>
            </p>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="h-12" />}>
        <JobFilters />
      </Suspense>

      <Suspense fallback={<p className="text-sm text-slate-500">Buscando vacantes...</p>}>
        <JobList userId={session.user.id} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
