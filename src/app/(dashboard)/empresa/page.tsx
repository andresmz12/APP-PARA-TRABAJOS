import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { CompanyStatusBadge } from '@/components/ui/Badge';
import { Briefcase, Users, Clock, PlusCircle, BadgeCheck } from 'lucide-react';
import type { Company } from '@/lib/types';

export default async function EmpresaDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const company = await queryOne<Company>('SELECT * FROM companies WHERE owner_id = $1', [session.user.id]);
  if (!company) redirect('/empresa/perfil');

  const [[{ count: totalJobs }], [{ count: activeJobs }], [{ count: totalApps }], [{ count: pendingApps }]] =
    await Promise.all([
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM jobs WHERE company_id = $1', [company.id]),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM jobs WHERE company_id = $1 AND status = $2', [company.id, 'activa']),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.company_id = $1', [company.id]),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.company_id = $1 AND a.status = $2', [company.id, 'pendiente']),
    ]);

  const stats = [
    { label: 'Vacantes activas', value: activeJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total vacantes', value: totalJobs, icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Aplicaciones totales', value: totalApps, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pendientes de revisar', value: pendingApps, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">{company.nombre}</h1>
            <CompanyStatusBadge status={company.status} />
            {company.verificada && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verificada
              </span>
            )}
          </div>
          {company.status === 'pendiente' && (
            <p className="text-sm text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              Tu empresa está pendiente de aprobación. Podrás publicar vacantes una vez aprobada.
            </p>
          )}
        </div>
        {company.status === 'aprobada' && (
          <Link
            href="/empresa/vacantes/nueva"
            className="flex items-center gap-2 bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva vacante
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/empresa/vacantes" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Gestionar vacantes</p>
                <p className="text-xs text-slate-500">Crea, edita o pausa tus empleos</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/empresa/aplicaciones" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Ver aplicaciones</p>
                <p className="text-xs text-slate-500">Revisa los perfiles de candidatos</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
