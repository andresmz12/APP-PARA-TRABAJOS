-- Run this in your Railway PostgreSQL database (via Railway's query console or psql)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('admin', 'empresa', 'candidato');
CREATE TYPE company_status AS ENUM ('pendiente', 'aprobada', 'rechazada');
CREATE TYPE job_status AS ENUM ('activa', 'pausada', 'cerrada');
CREATE TYPE application_status AS ENUM ('pendiente', 'contactado', 'rechazado');
CREATE TYPE job_area AS ENUM (
  'limpieza', 'logistica', 'ventas', 'administracion', 'construccion',
  'seguridad', 'cocina', 'tecnologia', 'salud', 'educacion', 'manufactura', 'otro'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'candidato',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
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
);

CREATE TABLE candidate_profiles (
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
);

CREATE TABLE jobs (
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
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pendiente',
  nota_empresa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
