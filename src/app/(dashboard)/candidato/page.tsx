import { createClient } from '@/lib/supabase/server';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import { Briefcase } from 'lucide-react';
import type { Job, JobArea } from '@/lib/types';
import { Suspense } from 'react';

interface PageProps {
  searchParams: { area?: string; q?: string };
}

async function JobList({ userId, searchParams }: { userId: string; searchParams: PageProps['searchParams'] }) {
  const supabase = createClient();

  let query = supabase
    .from('jobs')
    .select('*, company:companies(nombre, verificada, ciudad)')
    .eq('status', 'activa')
    .eq('companies.status', 'aprobada')
    .order('created_at', { ascending: false });

  if (searchParams.area) {
    query = query.eq('area', searchParams.area as JobArea);
  }
  if (searchParams.q) {
    query = query.or(
      `titulo.ilike.%${searchParams.q}%,cargo.ilike.%${searchParams.q}%,ubicacion.ilike.%${searchParams.q}%`
    );
  }

  const { data: jobs } = await query;

  // Obtener las aplicaciones del candidato para marcar cuáles ya aplicó
  const { data: myApps } = await supabase
    .from('applications')
    .select('job_id')
    .eq('candidate_id', userId);

  const appliedJobIds = new Set(myApps?.map((a) => a.job_id) ?? []);

  // Verificar si tiene perfil completo
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  const hasProfile = !!candidateProfile;

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="font-medium text-slate-700">No hay vacantes disponibles</p>
        <p className="text-sm text-slate-400 mt-1">
          Intenta con otros filtros o revisa más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {(jobs as (Job & { company: { nombre: string; verificada: boolean; ciudad: string } })[]).map(
        (job) => (
          <JobCard
            key={job.id}
            job={{
              ...job,
              company_nombre: job.company?.nombre,
              company_verificada: job.company?.verificada,
              company_ciudad: job.company?.ciudad,
            }}
            hasApplied={appliedJobIds.has(job.id)}
            hasProfile={hasProfile}
          />
        )
      )}
    </div>
  );
}

export default async function CandidatoFeedPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Avisar si no tiene perfil completo
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Empleos disponibles</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Encuentra tu próxima oportunidad laboral.
        </p>
      </div>

      {!candidateProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="shrink-0 text-amber-500 mt-0.5">⚠️</div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Completa tu perfil para aplicar</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Necesitas crear tu perfil antes de poder aplicar a vacantes.{' '}
              <a href="/candidato/perfil" className="underline font-medium">
                Ir a mi perfil →
              </a>
            </p>
          </div>
        </div>
      )}

      <JobFilters />

      <Suspense fallback={<p className="text-sm text-slate-500">Buscando vacantes...</p>}>
        <JobList userId={user.id} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
