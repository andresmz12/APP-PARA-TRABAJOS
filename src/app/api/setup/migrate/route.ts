import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ejecutar una sola vez para agregar la columna logo_url a companies
export async function POST() {
  await query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT`);
  return NextResponse.json({ ok: true, message: 'Migración aplicada: logo_url en companies.' });
}
