'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Building2, Camera, X } from 'lucide-react';
import type { Company } from '@/lib/types';

const MAX_SIZE_PX = 256;
const MAX_BYTES = 1.5 * 1024 * 1024; // 1.5 MB antes de comprimir

function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_BYTES) {
      reject(new Error('La imagen es demasiado grande. Usa una menor a 1.5 MB.'));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, MAX_SIZE_PX / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    img.src = url;
  });
}

export default function EmpresaPerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState('');

  const [form, setForm] = useState({
    nombre: '', descripcion: '', ciudad: '', telefono: '', sitio_web: '', logo_url: '',
  });

  useEffect(() => {
    fetch('/api/companies')
      .then((r) => r.json())
      .then(({ company: c }: { company: (Company & { logo_url?: string }) | null }) => {
        if (c) {
          setCompany(c);
          setForm({
            nombre: c.nombre ?? '',
            descripcion: c.descripcion ?? '',
            ciudad: c.ciudad ?? '',
            telefono: c.telefono ?? '',
            sitio_web: c.sitio_web ?? '',
            logo_url: c.logo_url ?? '',
          });
          if (c.logo_url) setLogoPreview(c.logo_url);
        }
        setLoading(false);
      });
  }, []);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    try {
      const base64 = await resizeImageToBase64(file);
      setLogoPreview(base64);
      setForm((prev) => ({ ...prev, logo_url: base64 }));
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Error al procesar la imagen.');
    }
    e.target.value = '';
  }

  function removeLogo() {
    setLogoPreview(null);
    setForm((prev) => ({ ...prev, logo_url: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const res = await fetch('/api/companies', {
      method: company ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'No se pudo guardar el perfil.');
    } else if (company) {
      setSuccess(true);
    } else {
      router.push('/empresa');
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {company ? 'Perfil de empresa' : 'Crear perfil de empresa'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {company ? 'Mantén tu información actualizada.' : 'Completa tu perfil para solicitar aprobación y publicar vacantes.'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Logo upload */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="relative shrink-0">
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Logo de empresa"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-sm transition-colors"
                    title="Quitar logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <Building2 className="w-7 h-7 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 mb-1">Logo de la empresa</p>
              <p className="text-xs text-slate-500 mb-2">JPG, PNG o GIF · máx. 1.5 MB · se redimensiona a 256×256</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {logoError && <p className="text-xs text-red-600 mt-1">{logoError}</p>}
            </div>
          </div>

          <Input
            label="Nombre de la empresa"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Florida Fresh Logistics LLC"
            required
          />
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="¿A qué se dedica tu empresa?"
            rows={3}
            hint="Ayuda a los candidatos a conocer tu empresa."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Ciudad, Estado" value={form.ciudad} onChange={(e) => handleChange('ciudad', e.target.value)} placeholder="Ej: Miami, FL" />
            <Input label="Teléfono de contacto" type="tel" value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} placeholder="Ej: (305) 123-4567" />
          </div>
          <Input label="Sitio web" type="url" value={form.sitio_web} onChange={(e) => handleChange('sitio_web', e.target.value)} placeholder="https://..." />

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">Perfil actualizado correctamente.</div>}

          <Button type="submit" loading={saving} className="w-full sm:w-auto self-end">
            {company ? 'Guardar cambios' : 'Crear perfil'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
