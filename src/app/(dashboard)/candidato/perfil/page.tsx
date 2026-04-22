'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { DIAS_SEMANA, TURNOS, type CandidateProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

const turnoOptions = TURNOS.map((t) => ({ value: t, label: t }));

export default function CandidatoPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [habilidadInput, setHabilidadInput] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    experiencia_previa: '',
    habilidades: [] as string[],
    tiene_vehiculo: false,
    tiene_moto: false,
    dias_disponibles: [] as string[],
    turno_preferido: '',
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setHasProfile(true);
        const p = data as CandidateProfile;
        setForm({
          nombre: p.nombre ?? '',
          telefono: p.telefono ?? '',
          ciudad: p.ciudad ?? '',
          experiencia_previa: p.experiencia_previa ?? '',
          habilidades: p.habilidades ?? [],
          tiene_vehiculo: p.tiene_vehiculo ?? false,
          tiene_moto: p.tiene_moto ?? false,
          dias_disponibles: p.dias_disponibles ?? [],
          turno_preferido: p.turno_preferido ?? '',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleChange(field: keyof typeof form, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDia(dia: string) {
    setForm((prev) => ({
      ...prev,
      dias_disponibles: prev.dias_disponibles.includes(dia)
        ? prev.dias_disponibles.filter((d) => d !== dia)
        : [...prev.dias_disponibles, dia],
    }));
  }

  function addHabilidad() {
    const trimmed = habilidadInput.trim();
    if (!trimmed || form.habilidades.includes(trimmed)) return;
    handleChange('habilidades', [...form.habilidades, trimmed]);
    setHabilidadInput('');
  }

  function removeHabilidad(i: number) {
    handleChange('habilidades', form.habilidades.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (hasProfile) {
      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update(form)
        .eq('id', user.id);
      if (updateError) setError('No se pudo actualizar el perfil.');
      else setSuccess(true);
    } else {
      const { error: insertError } = await supabase
        .from('candidate_profiles')
        .insert({ id: user.id, ...form });
      if (insertError) setError('No se pudo crear el perfil.');
      else {
        setHasProfile(true);
        setSuccess(true);
        router.refresh();
      }
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {hasProfile ? 'Mi perfil' : 'Crear mi perfil'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Tu perfil es tu aplicación. Cuanto más completo, mejor.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Datos básicos */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Datos personales</p>
            <div className="flex flex-col gap-4">
              <Input
                label="Nombre completo"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="300 123 4567"
                />
                <Input
                  label="Ciudad"
                  value={form.ciudad}
                  onChange={(e) => handleChange('ciudad', e.target.value)}
                  placeholder="Ej: Bogotá"
                />
              </div>
            </div>
          </div>

          {/* Experiencia */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Experiencia</p>
            <Textarea
              label="Experiencia previa"
              value={form.experiencia_previa}
              onChange={(e) => handleChange('experiencia_previa', e.target.value)}
              placeholder="Describe brevemente tu experiencia laboral anterior: empresas, cargos, tiempo trabajado..."
              rows={4}
              hint="No necesitas CV. Solo describe con tus palabras."
            />
          </div>

          {/* Habilidades */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Habilidades</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={habilidadInput}
                onChange={(e) => setHabilidadInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addHabilidad(); }
                }}
                placeholder="Ej: Manejo de montacargas, Excel..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
              <Button type="button" variant="outline" onClick={addHabilidad}>
                Agregar
              </Button>
            </div>
            {form.habilidades.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.habilidades.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full"
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() => removeHabilidad(i)}
                      className="text-blue-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Disponibilidad */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Disponibilidad</p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Días disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        form.dias_disponibles.includes(dia)
                          ? 'border-blue-700 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {dia.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Turno preferido"
                options={turnoOptions}
                value={form.turno_preferido}
                onChange={(e) => handleChange('turno_preferido', e.target.value)}
                placeholder="Selecciona un turno"
              />
            </div>
          </div>

          {/* Movilidad */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Movilidad</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.tiene_vehiculo}
                    onChange={(e) => handleChange('tiene_vehiculo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-700 transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-slate-700">Tengo vehículo propio (carro)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.tiene_moto}
                    onChange={(e) => handleChange('tiene_moto', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-700 transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-slate-700">Tengo moto propia</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
              Perfil guardado correctamente. Ya puedes aplicar a vacantes.
            </div>
          )}

          <Button type="submit" loading={saving} className="w-full sm:w-auto self-end">
            {hasProfile ? 'Guardar cambios' : 'Crear perfil'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
