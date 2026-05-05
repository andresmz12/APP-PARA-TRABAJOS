import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const companyId = req.nextUrl.searchParams.get('companyId');
  if (companyId) {
    // Verificar que la empresa pertenece al usuario autenticado
    const company = await queryOne(
      'SELECT id FROM companies WHERE id = $1 AND owner_id = $2',
      [companyId, session.user.id]
    );
    if (!company) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });

    const rows = await query(
      `SELECT a.*,
        json_build_object('titulo', j.titulo, 'area', j.area, 'company_id', j.company_id) AS job,
        json_build_object(
          'nombre', cp.nombre, 'telefono', cp.telefono, 'ciudad', cp.ciudad,
          'experiencia_previa', cp.experiencia_previa, 'habilidades', cp.habilidades,
          'tiene_vehiculo', cp.tiene_vehiculo,
          'dias_disponibles', cp.dias_disponibles, 'turno_preferido', cp.turno_preferido,
          'profile', json_build_object('email', u.email)
        ) AS candidate
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN candidate_profiles cp ON cp.id = a.candidate_id
       LEFT JOIN users u ON u.id = a.candidate_id
       WHERE j.company_id = $1
       ORDER BY a.created_at DESC`,
      [companyId]
    );
    return NextResponse.json({ applications: rows });
  }

  return NextResponse.json({ error: 'Parámetros requeridos.' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { job_id } = await req.json();
  if (!job_id) return NextResponse.json({ error: 'job_id requerido.' }, { status: 400 });

  const existing = await queryOne(
    'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
    [job_id, session.user.id]
  );
  if (existing) return NextResponse.json({ error: 'Ya aplicaste a esta vacante.' }, { status: 409 });

  const app = await queryOne(
    'INSERT INTO applications (job_id, candidate_id) VALUES ($1, $2) RETURNING *',
    [job_id, session.user.id]
  );
  return NextResponse.json({ application: app }, { status: 201 });
}
