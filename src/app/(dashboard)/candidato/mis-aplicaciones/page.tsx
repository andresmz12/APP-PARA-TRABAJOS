import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import { ClipboardList, MapPin, Clock, Building2, BadgeCheck } from 'lucide-react';
import { JOB_AREAS, type Application } from '@/lib/types';
import { formatSalary, timeAgo } from '@/lib/utils';

export default async function MisAplicacionesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(
        titulo, area, cargo, horario, ubicacion, salario_min, salario_max,
        company:companies(nombre, verificada)
      )
    `)
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mis aplicaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {applications?.length ?? 0} aplicación{applications?.length !== 1 ? 'es' : ''} enviada{applications?.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="text-center py-16">
          <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-700">Aún no has aplicado a ningún empleo</p>
          <p className="text-sm text-slate-400 mt-1">
            Busca vacantes disponibles y aplica con un clic.
          </p>
          <a
            href="/candidato"
            className="inline-block mt-4 text-sm text-blue-700 font-medium hover:underline"
          >
            Ver empleos disponibles →
          </a>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {(applications as Application[]).map((app) => {
            const job = app.job as typeof app.job & {
              company: { nombre: string; verificada: boolean };
            };
            return (
              <Card key={app.id}>
                <div className="flex flex-col gap-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{job?.titulo}</h3>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{job?.company?.nombre}</span>
                        {job?.company?.verificada && (
                          <BadgeCheck className="w-3.5 h-3.5 text-green-500 shrink-0" title="Empresa verificada" />
                        )}
                      </div>
                    </div>
                    {job?.area && (
                      <Badge variant="info">{JOB_AREAS[job.area]}</Badge>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {job?.ubicacion && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.ubicacion}
                      </span>
                    )}
                    {job?.horario && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.horario}
                      </span>
                    )}
                    {(job?.salario_min || job?.salario_max) && (
                      <span>{formatSalary(job.salario_min, job.salario_max)}</span>
                    )}
                    <span>Aplicaste {timeAgo(app.created_at)}</span>
                  </div>

                  {/* Estado info */}
                  {app.status === 'contactado' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 mt-1">
                      ¡La empresa ha marcado tu aplicación como contactado! Revisa tu email o espera su llamada.
                    </div>
                  )}
                  {app.status === 'rechazado' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 mt-1">
                      Esta aplicación fue rechazada. ¡No te rindas, sigue aplicando!
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
