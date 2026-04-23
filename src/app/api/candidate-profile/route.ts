import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const profile = await queryOne('SELECT * FROM candidate_profiles WHERE id = $1', [session.user.id]);
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { nombre, telefono, ciudad, experiencia_previa, habilidades, tiene_vehiculo, tiene_moto, dias_disponibles, turno_preferido } =
    await req.json();

  const profile = await queryOne(
    `INSERT INTO candidate_profiles
       (id, nombre, telefono, ciudad, experiencia_previa, habilidades, tiene_vehiculo, tiene_moto, dias_disponibles, turno_preferido)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET
       nombre=$2, telefono=$3, ciudad=$4, experiencia_previa=$5, habilidades=$6,
       tiene_vehiculo=$7, tiene_moto=$8, dias_disponibles=$9, turno_preferido=$10,
       updated_at=NOW()
     RETURNING *`,
    [session.user.id, nombre, telefono || null, ciudad || null, experiencia_previa || null,
     habilidades || [], tiene_vehiculo ?? false, tiene_moto ?? false, dias_disponibles || [], turno_preferido || null]
  );
  return NextResponse.json({ profile });
}
