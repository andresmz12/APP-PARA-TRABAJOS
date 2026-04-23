import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const body = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if ('status' in body) { fields.push(`status = $${idx++}`); values.push(body.status); }
  if ('verificada' in body) { fields.push(`verificada = $${idx++}`); values.push(body.verificada); }

  if (!fields.length) return NextResponse.json({ error: 'Sin cambios.' }, { status: 400 });
  fields.push(`updated_at = NOW()`);
  values.push(params.id);

  const rows = await query(`UPDATE companies SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
  return NextResponse.json({ company: rows[0] });
}
