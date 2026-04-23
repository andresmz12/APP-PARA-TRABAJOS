import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

async function ownsJob(userId: string, jobId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT j.id FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = $1 AND c.owner_id = $2',
    [jobId, userId]
  );
  return !!row;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const job = await queryOne('SELECT * FROM jobs WHERE id = $1', [params.id]);
  if (!job) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  if (!(await ownsJob(session.user.id, params.id))) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const body = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = ['titulo', 'area', 'cargo', 'descripcion', 'ubicacion', 'salario_min', 'salario_max', 'horario', 'modalidad', 'requisitos', 'status'];
  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = $${idx++}`);
      values.push(body[key]);
    }
  }
  if (!fields.length) return NextResponse.json({ error: 'Sin cambios.' }, { status: 400 });
  fields.push(`updated_at = NOW()`);
  values.push(params.id);

  const rows = await query(`UPDATE jobs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
  return NextResponse.json({ job: rows[0] });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  if (!(await ownsJob(session.user.id, params.id))) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  await query('DELETE FROM jobs WHERE id = $1', [params.id]);
  return NextResponse.json({ ok: true });
}
