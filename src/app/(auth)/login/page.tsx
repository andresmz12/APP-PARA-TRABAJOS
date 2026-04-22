'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email o contraseña incorrectos. Verifica tus datos.');
      setLoading(false);
      return;
    }

    router.push('/redirect');
    router.refresh();
  }

  return (
    <Card>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Iniciar sesión</h1>
      <p className="text-sm text-slate-500 mb-6">Bienvenido de vuelta.</p>

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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Entrar
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-5">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-blue-700 font-medium hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </Card>
  );
}
