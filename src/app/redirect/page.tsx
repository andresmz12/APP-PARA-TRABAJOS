import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Redirige al dashboard correcto según el rol del usuario
export default async function RedirectPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  if (profile.role === 'admin') redirect('/admin');
  if (profile.role === 'empresa') {
    // Revisar si ya tiene perfil de empresa
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    redirect(company ? '/empresa' : '/empresa/perfil');
  }

  // candidato
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  redirect(candidateProfile ? '/candidato' : '/candidato/perfil');
}
