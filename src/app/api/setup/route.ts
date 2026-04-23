import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';

export async function POST() {
  const existing = await queryOne('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
  if (existing) {
    return NextResponse.json({ message: 'Admin ya existe.' }, { status: 200 });
  }

  const hash = await bcrypt.hash('Admin123!', 10);
  await queryOne(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
    ['admin@trabajos.com', hash, 'admin']
  );

  return NextResponse.json({ message: 'Admin creado. Email: admin@trabajos.com / Admin123!' }, { status: 201 });
}
