import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const jobs = await query(
    `SELECT j.*, json_build_object('nombre', c.nombre, 'verificada', c.verificada) AS company
     FROM jobs j
     LEFT JOIN companies c ON c.id = j.company_id
     ORDER BY j.created_at DESC`
  );
  return NextResponse.json({ jobs });
}
