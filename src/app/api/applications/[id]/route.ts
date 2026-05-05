import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

const VALID_STATUS = ['pendiente', 'contactado', 'rechazado'] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const owns = await queryOne(
    `SELECT a.id FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     WHERE a.id = $1 AND c.owner_id = $2`,
    [params.id, session.user.id]
  );
  if (!owns) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });

  const body = await req.json();
  const { status, nota_empresa } = body;

  if (status !== undefined && !VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
  if (nota_empresa !== undefined) { fields.push(`nota_empresa = $${idx++}`); values.push(nota_empresa || null); }

  if (!fields.length) return NextResponse.json({ error: 'Sin cambios.' }, { status: 400 });
  fields.push('updated_at = NOW()');
  values.push(params.id);

  const rows = await query(
    `UPDATE applications SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return NextResponse.json({ application: rows[0] });
}

// Candidato retira su propia aplicación pendiente
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const app = await queryOne(
    'SELECT id, status FROM applications WHERE id = $1 AND candidate_id = $2',
    [params.id, session.user.id]
  );
  if (!app) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  if ((app as { status: string }).status !== 'pendiente') {
    return NextResponse.json({ error: 'Solo puedes retirar aplicaciones pendientes.' }, { status: 400 });
  }

  await query('DELETE FROM applications WHERE id = $1', [params.id]);
  return NextResponse.json({ ok: true });
}
