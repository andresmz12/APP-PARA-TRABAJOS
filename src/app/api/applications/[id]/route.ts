import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

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

  const { status } = await req.json();
  const rows = await query(
    'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, params.id]
  );
  return NextResponse.json({ application: rows[0] });
}
