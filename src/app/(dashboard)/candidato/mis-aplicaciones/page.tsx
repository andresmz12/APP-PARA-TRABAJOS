import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { ApplicationStatusBadge, Badge } from '@/components/ui/Badge';
import { ClipboardList, MapPin, Clock, Building2, BadgeCheck } from 'lucide-react';
import { JOB_AREAS, type Application, type Job, type Company } from '@/lib/types';
import { formatSalary, timeAgo } from '@/lib/utils';

type RichApp = Application & {
  job: Pick<Job, 'titulo' | 'area' | 'cargo' | 'horario' | 'ubicacion' | 'salario_min' | 'salario_max'> & {
    company: Pick<Company, 'nombre' | 'verificada'>;
  };
};

export default async function MisAplicacionesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const applications = await query<RichApp>(
    `SELECT a.*,
       json_build_object(
         'titulo', j.titulo, 'area', j.area, 'cargo', j.cargo,
         'horario', j.horario, 'ubicacion', j.ubicacion,
         'salario_min', j.salario_min, 'salario_max', j.salario_max,
         'company', json_build_object('nombre', c.nombre, 'verificada', c.verificada)
       ) AS job
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     LEFT JOIN companies c ON c.id = j.company_id
     WHERE a.candidate_id = $1
     ORDER BY a.created_at DESC`,
    [session.user.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mis aplicaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {applications.length} aplicación{applications.length !== 1 ? 'es' : ''} enviada{applications.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-16">
          <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-700">Aún no has aplicado a ningún empleo</p>
          <p className="text-sm text-slate-400 mt-1">Busca vacantes disponibles y aplica con un clic.</p>
          <a href="/candidato" className="inline-block mt-4 text-sm text-blue-700 font-medium hover:underline">
            Ver empleos disponibles →
          </a>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{app.job?.titulo}</h3>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{app.job?.company?.nombre}</span>
                      {app.job?.company?.verificada && (
                        <BadgeCheck className="w-3.5 h-3.5 text-green-500 shrink-0" aria-label="Empresa verificada" />
                      )}
                    </div>
                  </div>
                  {app.job?.area && <Badge variant="info">{JOB_AREAS[app.job.area]}</Badge>}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  {app.job?.ubicacion && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.job.ubicacion}</span>
                  )}
                  {app.job?.horario && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.job.horario}</span>
                  )}
                  {(app.job?.salario_min || app.job?.salario_max) && (
                    <span>{formatSalary(app.job.salario_min, app.job.salario_max)}</span>
                  )}
                  <span>Aplicaste {timeAgo(app.created_at)}</span>
                </div>

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
          ))}
        </div>
      )}
    </div>
  );
}
