import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const company = await queryOne(
    'SELECT * FROM companies WHERE owner_id = $1',
    [session.user.id]
  );
  return NextResponse.json({ company });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { nombre, descripcion, ciudad, telefono, sitio_web, logo_url } = await req.json();
  if (!nombre) return NextResponse.json({ error: 'El nombre es requerido.' }, { status: 400 });

  const company = await queryOne(
    `INSERT INTO companies (owner_id, nombre, descripcion, ciudad, telefono, sitio_web, logo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [session.user.id, nombre, descripcion || null, ciudad || null, telefono || null, sitio_web || null, logo_url || null]
  );
  return NextResponse.json({ company }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { nombre, descripcion, ciudad, telefono, sitio_web, logo_url } = await req.json();

  const rows = await query(
    `UPDATE companies SET nombre=$1, descripcion=$2, ciudad=$3, telefono=$4, sitio_web=$5, logo_url=$6, updated_at=NOW()
     WHERE owner_id=$7 RETURNING *`,
    [nombre, descripcion || null, ciudad || null, telefono || null, sitio_web || null, logo_url ?? undefined, session.user.id]
  );
  if (!rows.length) return NextResponse.json({ error: 'Empresa no encontrada.' }, { status: 404 });
  return NextResponse.json({ company: rows[0] });
}
