import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
  }
  if (!['empresa', 'candidato'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await queryOne<{ id: string; email: string; role: string }>(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email.toLowerCase(), hash, role]
  );

  return NextResponse.json({ user }, { status: 201 });
}
