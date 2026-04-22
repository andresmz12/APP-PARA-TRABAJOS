'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Pencil, Pause, Play, Trash2 } from 'lucide-react';
import type { JobStatus } from '@/lib/types';

interface VacanteActionsProps {
  jobId: string;
  status: JobStatus;
}

export default function VacanteActions({ jobId, status }: VacanteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: JobStatus) {
    setLoading(newStatus);
    const supabase = createClient();
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
    router.refresh();
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm('¿Seguro que quieres eliminar esta vacante? Esta acción no se puede deshacer.')) return;
    setLoading('delete');
    const supabase = createClient();
    await supabase.from('jobs').delete().eq('id', jobId);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      <Link href={`/empresa/vacantes/${jobId}/editar`}>
        <Button size="sm" variant="outline">
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Button>
      </Link>

      {status === 'activa' ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => updateStatus('pausada')}
          loading={loading === 'pausada'}
        >
          <Pause className="w-3.5 h-3.5" />
          Pausar
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => updateStatus('activa')}
          loading={loading === 'activa'}
        >
          <Play className="w-3.5 h-3.5" />
          Activar
        </Button>
      )}

      <Button
        size="sm"
        variant="danger"
        onClick={handleDelete}
        loading={loading === 'delete'}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
