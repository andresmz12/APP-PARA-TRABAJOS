import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { CompanyStatusBadge } from '@/components/ui/Badge';
import { Briefcase, Users, Clock, PlusCircle, BadgeCheck } from 'lucide-react';

export default async function EmpresaDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!company) redirect('/empresa/perfil');

  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: totalApps },
    { count: pendingApps },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', company.id).eq('status', 'activa'),
    supabase
      .from('applications')
      .select('*, job:jobs!inner(company_id)', { count: 'exact', head: true })
      .eq('job.company_id', company.id),
    supabase
      .from('applications')
      .select('*, job:jobs!inner(company_id)', { count: 'exact', head: true })
      .eq('job.company_id', company.id)
      .eq('status', 'pendiente'),
  ]);

  const stats = [
    { label: 'Vacantes activas', value: activeJobs ?? 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total vacantes', value: totalJobs ?? 0, icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Aplicaciones totales', value: totalApps ?? 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pendientes de revisar', value: pendingApps ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <p className="text-sm text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2">
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

      {/* Stats */}
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

      {/* Accesos rápidos */}
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
