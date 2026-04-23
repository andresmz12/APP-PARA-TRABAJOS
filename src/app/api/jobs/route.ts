import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const company = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM companies WHERE owner_id = $1',
    [session.user.id]
  );
  if (!company) return NextResponse.json({ error: 'Empresa no encontrada.' }, { status: 404 });
  if (company.status !== 'aprobada') {
    return NextResponse.json({ error: 'Tu empresa debe estar aprobada para publicar vacantes.' }, { status: 403 });
  }

  const { titulo, area, cargo, descripcion, ubicacion, salario_min, salario_max, horario, modalidad, requisitos } =
    await req.json();

  const job = await queryOne(
    `INSERT INTO jobs (company_id, titulo, area, cargo, descripcion, ubicacion, salario_min, salario_max, horario, modalidad, requisitos)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [company.id, titulo, area, cargo, descripcion, ubicacion, salario_min || null, salario_max || null, horario, modalidad || 'presencial', requisitos || []]
  );
  return NextResponse.json({ job }, { status: 201 });
}
