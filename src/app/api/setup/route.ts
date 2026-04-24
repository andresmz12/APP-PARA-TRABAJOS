import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';

async function setup() {
  try {
    const existing = await queryOne('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (existing) {
      return NextResponse.json({ message: 'Admin ya existe.' });
    }

    const hash = await bcrypt.hash('Admin123!', 10);
    await queryOne(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      ['admin@trabajos.com', hash, 'admin']
    );

    return NextResponse.json(
      { message: 'Admin creado.', email: 'admin@trabajos.com', password: 'Admin123!' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[setup]', err);
    return NextResponse.json(
      { error: 'Setup falló', detail: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() { return setup(); }

export async function POST() { return setup(); }
