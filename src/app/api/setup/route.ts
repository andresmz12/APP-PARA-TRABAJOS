import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';

async function ensureSchema() {
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  await query(`DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'empresa', 'candidato');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

  await query(`DO $$ BEGIN
    CREATE TYPE company_status AS ENUM ('pendiente', 'aprobada', 'rechazada');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

  await query(`DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('activa', 'pausada', 'cerrada');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

  await query(`DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pendiente', 'contactado', 'rechazado');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

  await query(`DO $$ BEGIN
    CREATE TYPE job_area AS ENUM (
      'limpieza','logistica','ventas','administracion','construccion',
      'seguridad','cocina','tecnologia','salud','educacion','manufactura','otro'
    );
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

  await query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'candidato',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    ciudad TEXT,
    telefono TEXT,
    sitio_web TEXT,
    verificada BOOLEAN NOT NULL DEFAULT false,
    status company_status NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT,
    ciudad TEXT,
    experiencia_previa TEXT,
    habilidades TEXT[] NOT NULL DEFAULT '{}',
    tiene_vehiculo BOOLEAN NOT NULL DEFAULT false,
    tiene_moto BOOLEAN NOT NULL DEFAULT false,
    dias_disponibles TEXT[] NOT NULL DEFAULT '{}',
    turno_preferido TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    area job_area NOT NULL,
    cargo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    salario_min INTEGER,
    salario_max INTEGER,
    horario TEXT NOT NULL DEFAULT '',
    modalidad TEXT NOT NULL DEFAULT 'presencial',
    requisitos TEXT[] NOT NULL DEFAULT '{}',
    status job_status NOT NULL DEFAULT 'activa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await query(`CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'pendiente',
    nota_empresa TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
  )`);

  await query(`CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $fn$ LANGUAGE plpgsql`);

  for (const [trig, tbl] of [
    ['trg_companies_updated_at', 'companies'],
    ['trg_jobs_updated_at', 'jobs'],
    ['trg_applications_updated_at', 'applications'],
    ['trg_candidate_profiles_updated_at', 'candidate_profiles'],
  ]) {
    await query(`DO $$ BEGIN
      CREATE TRIGGER ${trig} BEFORE UPDATE ON ${tbl}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
  }
}

async function setup() {
  try {
    await ensureSchema();

    const existing = await queryOne('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (existing) {
      return NextResponse.json({ message: 'Admin ya existe. Todo listo.' });
    }

    const hash = await bcrypt.hash('Admin123!', 10);
    await queryOne(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      ['admin@trabajos.com', hash, 'admin']
    );

    return NextResponse.json(
      { message: 'Setup completo.', email: 'admin@trabajos.com', password: 'Admin123!' },
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
