'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Undo2 } from 'lucide-react';

export default function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  async function handleWithdraw() {
    if (!confirm('¿Retirar esta aplicación? No podrás recuperarla.')) return;
    setLoading(true);
    const res = await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
    if (res.ok) setWithdrawn(true);
    setLoading(false);
  }

  if (withdrawn) {
    return <span className="text-xs text-slate-400 italic">Aplicación retirada</span>;
  }

  return (
    <Button size="sm" variant="ghost" loading={loading} onClick={handleWithdraw}>
      <Undo2 className="w-3.5 h-3.5" />
      Retirar
    </Button>
  );
}
