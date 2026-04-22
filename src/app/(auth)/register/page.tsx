'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('rol') === 'empresa' ? 'empresa' : 'candidato';

  const [role, setRole] = useState<'empresa' | 'candidato'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/redirect`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Iniciar sesión directamente (sin confirmación de email para agilizar el MVP)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Cuenta creada. Por favor inicia sesión.');
      router.push('/login');
      return;
    }

    router.push('/redirect');
    router.refresh();
  }

  return (
    <Card>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Crear cuenta</h1>
      <p className="text-sm text-slate-500 mb-5">¿Cómo vas a usar la plataforma?</p>

      {/* Selector de rol */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {(
          [
            { value: 'candidato', label: 'Soy Candidato', icon: Users },
            { value: 'empresa', label: 'Soy Empresa', icon: Building2 },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all',
              role === value
                ? 'border-blue-700 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          {role === 'empresa' ? 'Registrar empresa' : 'Crear cuenta'}
        </Button>
      </form>

      {role === 'empresa' && (
        <p className="text-xs text-slate-500 text-center mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Tu empresa será revisada por el administrador antes de poder publicar vacantes.
        </p>
      )}

      <p className="text-sm text-slate-500 text-center mt-4">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-blue-700 font-medium hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </Card>
  );
}
