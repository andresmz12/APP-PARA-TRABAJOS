import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { role, id } = session.user;

  if (role === 'admin') redirect('/admin');

  if (role === 'empresa') {
    const company = await queryOne('SELECT id FROM companies WHERE owner_id = $1', [id]);
    redirect(company ? '/empresa' : '/empresa/perfil');
  }

  const profile = await queryOne('SELECT id FROM candidate_profiles WHERE id = $1', [id]);
  redirect(profile ? '/candidato' : '/candidato/perfil');
}
