import { query } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Building2, Briefcase, Users, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const [[{ count: totalEmpresas }], [{ count: pendientes }], [{ count: totalJobs }], [{ count: totalApps }]] =
    await Promise.all([
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM companies'),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM companies WHERE status = $1', ['pendiente']),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM jobs'),
      query<{ count: number }>('SELECT COUNT(*)::int AS count FROM applications'),
    ]);

  const stats = [
    { label: 'Total Empresas', value: totalEmpresas, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Empresas Pendientes', value: pendientes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Vacantes', value: totalJobs, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Aplicaciones', value: totalApps, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vista general de la plataforma.</p>
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

      {pendientes > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {pendientes} empresa{pendientes !== 1 ? 's' : ''} esperando aprobación
              </p>
              <a href="/admin/empresas" className="text-xs text-amber-700 hover:underline">
                Ir a revisar →
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
