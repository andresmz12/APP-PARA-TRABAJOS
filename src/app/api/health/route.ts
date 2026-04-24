import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET() {
  const checks: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'MISSING',
  };

  try {
    await queryOne('SELECT 1');
    checks.db = 'ok';
  } catch (err) {
    checks.db = `error: ${(err as Error).message}`;
  }

  const ok = checks.db === 'ok' && checks.DATABASE_URL === 'set' && checks.NEXTAUTH_SECRET === 'set';
  return NextResponse.json(checks, { status: ok ? 200 : 500 });
}
