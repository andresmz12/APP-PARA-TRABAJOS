'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { JOB_AREAS, type JobArea } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const areaOptions = Object.entries(JOB_AREAS).map(([value, label]) => ({
  value,
  label,
}));

const modalidadOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
];

export default function NuevaVacantePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [requisitoInput, setRequisitoInput] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    area: '' as JobArea,
    cargo: '',
    descripcion: '',
    salario_min: '',
    salario_max: '',
    horario: '',
    ubicacion: '',
    modalidad: 'presencial',
    requisitos: [] as string[],
  });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addRequisito() {
    const trimmed = requisitoInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, requisitos: [...prev.requisitos, trimmed] }));
    setRequisitoInput('');
  }

  function removeRequisito(i: number) {
    setForm((prev) => ({
      ...prev,
      requisitos: prev.requisitos.filter((_, idx) => idx !== i),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.area) {
      setError('Selecciona un área.');
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!company) {
      setError('No se encontró tu empresa.');
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from('jobs').insert({
      company_id: company.id,
      titulo: form.titulo,
      area: form.area,
      cargo: form.cargo,
      descripcion: form.descripcion,
      salario_min: form.salario_min ? parseInt(form.salario_min) : null,
      salario_max: form.salario_max ? parseInt(form.salario_max) : null,
      horario: form.horario,
      ubicacion: form.ubicacion,
      modalidad: form.modalidad,
      requisitos: form.requisitos,
    });

    if (insertError) {
      setError('No se pudo publicar la vacante. Verifica que tu empresa esté aprobada.');
    } else {
      router.push('/empresa/vacantes');
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/empresa/vacantes" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nueva vacante</h1>
          <p className="text-sm text-slate-500 mt-0.5">Completa los detalles del puesto.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Clasificación */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Clasificación</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Área"
                options={areaOptions}
                value={form.area}
                onChange={(e) => handleChange('area', e.target.value)}
                placeholder="Selecciona un área"
                required
              />
              <Input
                label="Cargo"
                value={form.cargo}
                onChange={(e) => handleChange('cargo', e.target.value)}
                placeholder="Ej: Operario, Supervisor, Conductor"
                required
              />
            </div>
            <div className="mt-4">
              <Input
                label="Título del empleo"
                value={form.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ej: Operario de Limpieza — Turno Noche"
                required
                hint="Un título claro atrae más candidatos."
              />
            </div>
          </div>

          {/* Detalles */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Detalles del puesto</p>
            <div className="flex flex-col gap-4">
              <Textarea
                label="Descripción"
                value={form.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Describe las funciones del cargo, responsabilidades principales, condiciones de trabajo..."
                rows={4}
                required
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Horario"
                  value={form.horario}
                  onChange={(e) => handleChange('horario', e.target.value)}
                  placeholder="Ej: Lunes a Viernes 7am-5pm"
                  required
                />
                <Select
                  label="Modalidad"
                  options={modalidadOptions}
                  value={form.modalidad}
                  onChange={(e) => handleChange('modalidad', e.target.value)}
                />
              </div>
              <Input
                label="Ubicación"
                value={form.ubicacion}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                placeholder="Ej: Zona Industrial, Bogotá"
                required
              />
            </div>
          </div>

          {/* Salario */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Salario (opcional)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Salario mínimo (COP)"
                type="number"
                value={form.salario_min}
                onChange={(e) => handleChange('salario_min', e.target.value)}
                placeholder="Ej: 1300000"
                min="0"
              />
              <Input
                label="Salario máximo (COP)"
                type="number"
                value={form.salario_max}
                onChange={(e) => handleChange('salario_max', e.target.value)}
                placeholder="Ej: 1800000"
                min="0"
              />
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Requisitos específicos</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={requisitoInput}
                onChange={(e) => setRequisitoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequisito();
                  }
                }}
                placeholder="Ej: Experiencia en montacargas, Bachiller..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              />
              <Button type="button" variant="outline" size="md" onClick={addRequisito}>
                Agregar
              </Button>
            </div>
            {form.requisitos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.requisitos.map((req, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequisito(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Link href="/empresa/vacantes">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" loading={saving}>
              Publicar vacante
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
