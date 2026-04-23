import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const filter = req.nextUrl.searchParams.get('status');
  let sql = 'SELECT * FROM companies ORDER BY created_at DESC';
  const params: string[] = [];
  if (filter && filter !== 'todas') {
    sql = 'SELECT * FROM companies WHERE status = $1 ORDER BY created_at DESC';
    params.push(filter);
  }

  const companies = await query(sql, params);
  return NextResponse.json({ companies });
}
