'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { ApplicationStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Users,
  Phone,
  MapPin,
  Car,
  Bike,
  CalendarDays,
  Briefcase,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Application, ApplicationStatus } from '@/lib/types';

interface RichApplication extends Application {
  job: { titulo: string; area: string };
  candidate: {
    nombre: string;
    telefono?: string;
    ciudad?: string;
    experiencia_previa?: string;
    habilidades: string[];
    tiene_vehiculo: boolean;
    tiene_moto: boolean;
    dias_disponibles: string[];
    turno_preferido?: string;
    profile?: { email: string };
  };
}

export default function EmpresaAplicacionesPage() {
  const [applications, setApplications] = useState<RichApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'todas'>('todas');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    if (!company) return;

    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs!inner(titulo, area, company_id),
        candidate:candidate_profiles(
          nombre, telefono, ciudad, experiencia_previa,
          habilidades, tiene_vehiculo, tiene_moto,
          dias_disponibles, turno_preferido,
          profile:profiles(email)
        )
      `)
      .eq('job.company_id', company.id)
      .order('created_at', { ascending: false });

    if (filterStatus !== 'todas') {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query;
    setApplications((data as RichApplication[]) ?? []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function updateStatus(appId: string, status: ApplicationStatus) {
    const supabase = createClient();
    await supabase.from('applications').update({ status }).eq('id', appId);
    fetchApplications();
  }

  const filterBtns: { value: ApplicationStatus | 'todas'; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'contactado', label: 'Contactados' },
    { value: 'rechazado', label: 'Rechazados' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Aplicaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {applications.length} aplicación{applications.length !== 1 ? 'es' : ''}.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filterBtns.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === value
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : applications.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-700">Sin aplicaciones</p>
          <p className="text-sm text-slate-400 mt-1">
            Los candidatos que apliquen aparecerán aquí.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <Card key={app.id}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {app.candidate?.nombre ?? 'Sin nombre'}
                    </span>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Para: {app.job?.titulo}
                    </span>
                    {app.candidate?.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {app.candidate.telefono}
                      </span>
                    )}
                    {app.candidate?.ciudad && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.candidate.ciudad}
                      </span>
                    )}
                    <span>{timeAgo(app.created_at)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                    className="text-xs text-blue-700 underline hover:no-underline"
                  >
                    {expanded === app.id ? 'Ocultar perfil' : 'Ver perfil'}
                  </button>
                  {app.status !== 'contactado' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => updateStatus(app.id, 'contactado')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Contactar
                    </Button>
                  )}
                  {app.status !== 'rechazado' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateStatus(app.id, 'rechazado')}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                  )}
                </div>
              </div>

              {/* Perfil expandido */}
              {expanded === app.id && app.candidate && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4 text-sm">
                  {app.candidate.experiencia_previa && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Experiencia previa
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        {app.candidate.experiencia_previa}
                      </p>
                    </div>
                  )}

                  {app.candidate.habilidades.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Habilidades
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.candidate.habilidades.map((h, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Disponibilidad
                    </p>
                    <div className="space-y-1">
                      {app.candidate.dias_disponibles.length > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          {app.candidate.dias_disponibles.join(', ')}
                        </div>
                      )}
                      {app.candidate.turno_preferido && (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          Turno: {app.candidate.turno_preferido}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Movilidad
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span className={app.candidate.tiene_vehiculo ? 'text-green-700 font-medium' : 'text-slate-500'}>
                          Vehículo: {app.candidate.tiene_vehiculo ? 'Sí' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-slate-400" />
                        <span className={app.candidate.tiene_moto ? 'text-green-700 font-medium' : 'text-slate-500'}>
                          Moto: {app.candidate.tiene_moto ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {app.candidate.profile?.email && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        Email de contacto:{' '}
                        <a
                          href={`mailto:${app.candidate.profile.email}`}
                          className="text-blue-700 hover:underline"
                        >
                          {app.candidate.profile.email}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
