'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { CompanyStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CheckCircle2, XCircle, BadgeCheck, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Company } from '@/lib/types';

export default function AdminEmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas');

  const fetchCompanies = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'todas') query = query.eq('status', filter);

    const { data } = await query;
    setCompanies(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  async function updateStatus(id: string, status: 'aprobada' | 'rechazada') {
    const supabase = createClient();
    await supabase.from('companies').update({ status }).eq('id', id);
    fetchCompanies();
  }

  async function toggleVerified(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from('companies').update({ verificada: !current }).eq('id', id);
    fetchCompanies();
  }

  const filters = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aprobada', label: 'Aprobadas' },
    { value: 'rechazada', label: 'Rechazadas' },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Empresas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Aprueba, rechaza y verifica empresas.</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : companies.length === 0 ? (
        <Card className="text-center py-10">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No hay empresas en esta categoría.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <Card key={company.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{company.nombre}</span>
                    <CompanyStatusBadge status={company.status} />
                    {company.verificada && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verificada
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {company.ciudad && `${company.ciudad} · `}
                    {company.telefono && `${company.telefono} · `}
                    Registrada {formatDate(company.created_at)}
                  </p>
                  {company.descripcion && (
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
                      {company.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {/* Verificar / desverificar */}
                  <Button
                    size="sm"
                    variant={company.verificada ? 'secondary' : 'outline'}
                    onClick={() => toggleVerified(company.id, company.verificada)}
                    title={company.verificada ? 'Quitar verificación' : 'Marcar como verificada'}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {company.verificada ? 'Verificada' : 'Verificar'}
                  </Button>

                  {company.status !== 'aprobada' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => updateStatus(company.id, 'aprobada')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprobar
                    </Button>
                  )}
                  {company.status !== 'rechazada' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateStatus(company.id, 'rechazada')}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
