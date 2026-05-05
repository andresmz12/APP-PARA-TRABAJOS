import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_STATUS = ['activa', 'pausada', 'cerrada'] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const { status } = await req.json();
  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const rows = await query(
    'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, params.id]
  );
  if (!rows.length) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  return NextResponse.json({ job: rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  await query('DELETE FROM jobs WHERE id = $1', [params.id]);
  return NextResponse.json({ ok: true });
}
