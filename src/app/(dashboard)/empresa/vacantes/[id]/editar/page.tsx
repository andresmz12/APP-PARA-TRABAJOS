'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { JOB_AREAS, type JobArea, type Job } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

const areaOptions = Object.entries(JOB_AREAS).map(([value, label]) => ({ value, label }));
const modalidadOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
];

export default function EditarVacantePage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      if (data) {
        const job = data as Job;
        setForm({
          titulo: job.titulo,
          area: job.area,
          cargo: job.cargo,
          descripcion: job.descripcion,
          salario_min: job.salario_min?.toString() ?? '',
          salario_max: job.salario_max?.toString() ?? '',
          horario: job.horario,
          ubicacion: job.ubicacion,
          modalidad: job.modalidad,
          requisitos: job.requisitos ?? [],
        });
      }
      setLoading(false);
    }
    load();
  }, [jobId]);

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
    setForm((prev) => ({ ...prev, requisitos: prev.requisitos.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        ...form,
        salario_min: form.salario_min ? parseInt(form.salario_min) : null,
        salario_max: form.salario_max ? parseInt(form.salario_max) : null,
      })
      .eq('id', jobId);

    if (updateError) {
      setError('No se pudo guardar los cambios.');
    } else {
      router.push('/empresa/vacantes');
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/empresa/vacantes" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Editar vacante</h1>
          <p className="text-sm text-slate-500 mt-0.5">Actualiza los detalles del puesto.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Área"
              options={areaOptions}
              value={form.area}
              onChange={(e) => handleChange('area', e.target.value)}
              required
            />
            <Input
              label="Cargo"
              value={form.cargo}
              onChange={(e) => handleChange('cargo', e.target.value)}
              placeholder="Ej: Supervisor, Operario"
              required
            />
          </div>
          <Input
            label="Título del empleo"
            value={form.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            required
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            rows={4}
            required
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Horario"
              value={form.horario}
              onChange={(e) => handleChange('horario', e.target.value)}
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
            required
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Salario mínimo (COP)"
              type="number"
              value={form.salario_min}
              onChange={(e) => handleChange('salario_min', e.target.value)}
              min="0"
            />
            <Input
              label="Salario máximo (COP)"
              type="number"
              value={form.salario_max}
              onChange={(e) => handleChange('salario_max', e.target.value)}
              min="0"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Requisitos</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={requisitoInput}
                onChange={(e) => setRequisitoInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequisito(); } }}
                placeholder="Agregar requisito..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
              <Button type="button" variant="outline" onClick={addRequisito}>Agregar</Button>
            </div>
            {form.requisitos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.requisitos.map((req, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                    {req}
                    <button type="button" onClick={() => removeRequisito(i)} className="text-slate-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Link href="/empresa/vacantes"><Button type="button" variant="outline">Cancelar</Button></Link>
            <Button type="submit" loading={saving}>Guardar cambios</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
