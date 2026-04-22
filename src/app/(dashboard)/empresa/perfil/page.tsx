'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Building2 } from 'lucide-react';
import type { Company } from '@/lib/types';

export default function EmpresaPerfilPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    ciudad: '',
    telefono: '',
    sitio_web: '',
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setCompany(data);
        setForm({
          nombre: data.nombre ?? '',
          descripcion: data.descripcion ?? '',
          ciudad: data.ciudad ?? '',
          telefono: data.telefono ?? '',
          sitio_web: data.sitio_web ?? '',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (company) {
      const { error: updateError } = await supabase
        .from('companies')
        .update(form)
        .eq('id', company.id);
      if (updateError) setError('No se pudo actualizar el perfil.');
      else setSuccess(true);
    } else {
      const { error: insertError } = await supabase
        .from('companies')
        .insert({ ...form, owner_id: user.id });
      if (insertError) setError('No se pudo crear el perfil de empresa.');
      else {
        router.push('/empresa');
        router.refresh();
      }
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando...</p>;
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {company ? 'Perfil de empresa' : 'Crear perfil de empresa'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {company
            ? 'Mantén tu información actualizada.'
            : 'Completa tu perfil para solicitar aprobación y publicar vacantes.'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-xs text-slate-500">
              Logo de empresa (próximamente)
            </div>
          </div>

          <Input
            label="Nombre de la empresa"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Distribuidora López S.A.S"
            required
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="¿A qué se dedica tu empresa? ¿Cuántos empleados tiene?"
            rows={3}
            hint="Ayuda a los candidatos a conocer tu empresa."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              value={form.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              placeholder="Ej: Bogotá"
            />
            <Input
              label="Teléfono de contacto"
              type="tel"
              value={form.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Ej: 300 123 4567"
            />
          </div>
          <Input
            label="Sitio web"
            type="url"
            value={form.sitio_web}
            onChange={(e) => handleChange('sitio_web', e.target.value)}
            placeholder="https://..."
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
              Perfil actualizado correctamente.
            </div>
          )}

          <Button type="submit" loading={saving} className="w-full sm:w-auto self-end">
            {company ? 'Guardar cambios' : 'Crear perfil'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
