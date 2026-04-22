-- ============================================================
-- APP PARA TRABAJOS — Esquema de Base de Datos
-- Ejecuta este script en Supabase SQL Editor
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'empresa', 'candidato');
CREATE TYPE company_status AS ENUM ('pendiente', 'aprobada', 'rechazada');
CREATE TYPE job_status AS ENUM ('activa', 'pausada', 'cerrada');
CREATE TYPE application_status AS ENUM ('pendiente', 'contactado', 'rechazado');
CREATE TYPE job_area AS ENUM (
  'limpieza',
  'logistica',
  'ventas',
  'administracion',
  'construccion',
  'seguridad',
  'cocina',
  'tecnologia',
  'salud',
  'educacion',
  'manufactura',
  'otro'
);

-- ============================================================
-- TABLAS
-- ============================================================

-- Perfiles (extiende auth.users de Supabase)
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT        NOT NULL,
  role        user_role   NOT NULL DEFAULT 'candidato',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Perfiles de Candidatos
CREATE TABLE candidate_profiles (
  id                 UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  nombre             TEXT        NOT NULL,
  telefono           TEXT,
  ciudad             TEXT,
  experiencia_previa TEXT,
  habilidades        TEXT[]      NOT NULL DEFAULT '{}',
  tiene_vehiculo     BOOLEAN     NOT NULL DEFAULT FALSE,
  tiene_moto         BOOLEAN     NOT NULL DEFAULT FALSE,
  dias_disponibles   TEXT[]      NOT NULL DEFAULT '{}',
  turno_preferido    TEXT,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Empresas
CREATE TABLE companies (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre      TEXT        NOT NULL,
  descripcion TEXT,
  ciudad      TEXT,
  sitio_web   TEXT,
  telefono    TEXT,
  status      company_status NOT NULL DEFAULT 'pendiente',
  verificada  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Empleos / Vacantes
CREATE TABLE jobs (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  titulo      TEXT        NOT NULL,
  area        job_area    NOT NULL,
  cargo       TEXT        NOT NULL,
  descripcion TEXT        NOT NULL,
  salario_min INTEGER,
  salario_max INTEGER,
  horario     TEXT        NOT NULL,
  ubicacion   TEXT        NOT NULL,
  modalidad   TEXT        NOT NULL DEFAULT 'presencial',
  requisitos  TEXT[]      NOT NULL DEFAULT '{}',
  status      job_status  NOT NULL DEFAULT 'activa',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aplicaciones
CREATE TABLE applications (
  id            UUID               NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id        UUID               NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id  UUID               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        application_status NOT NULL DEFAULT 'pendiente',
  nota_empresa  TEXT,
  created_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Crea perfil automáticamente al registrarse un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'candidato'
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER candidate_profiles_updated_at
  BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;

-- Helper: verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ---- PROFILES ----
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---- CANDIDATE PROFILES ----
CREATE POLICY "candidate_select_own" ON candidate_profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "candidate_insert_own" ON candidate_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "candidate_update_own" ON candidate_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Empresas pueden ver candidatos que aplicaron a sus puestos
CREATE POLICY "candidate_select_for_empresa" ON candidate_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM applications a
      JOIN jobs j       ON j.id = a.job_id
      JOIN companies c  ON c.id = j.company_id
      WHERE a.candidate_id = candidate_profiles.id
        AND c.owner_id = auth.uid()
    )
  );

-- ---- COMPANIES ----
CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY "companies_select_approved" ON companies
  FOR SELECT USING (status = 'aprobada');

CREATE POLICY "companies_insert_own" ON companies
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE USING (owner_id = auth.uid() OR is_admin());

CREATE POLICY "companies_admin_all" ON companies
  FOR ALL USING (is_admin());

-- ---- JOBS ----
CREATE POLICY "jobs_select_active" ON jobs
  FOR SELECT USING (
    (status = 'activa' AND EXISTS (
      SELECT 1 FROM companies WHERE id = company_id AND status = 'aprobada'
    ))
    OR is_admin()
    OR EXISTS (SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid())
  );

CREATE POLICY "jobs_insert_empresa" ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid())
  );

CREATE POLICY "jobs_update_empresa" ON jobs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "jobs_delete_empresa" ON jobs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND owner_id = auth.uid())
    OR is_admin()
  );

-- ---- APPLICATIONS ----
CREATE POLICY "applications_select_candidate" ON applications
  FOR SELECT USING (candidate_id = auth.uid() OR is_admin());

CREATE POLICY "applications_insert_candidate" ON applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "applications_delete_candidate" ON applications
  FOR DELETE USING (candidate_id = auth.uid());

CREATE POLICY "applications_select_empresa" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = job_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "applications_update_empresa" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = job_id AND c.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================
-- VISTAS ÚTILES (sin RLS, para queries del lado del servidor)
-- ============================================================

-- Vista de empleos con datos de empresa (para el feed de candidatos)
CREATE OR REPLACE VIEW jobs_with_company AS
SELECT
  j.*,
  c.nombre      AS company_nombre,
  c.verificada  AS company_verificada,
  c.ciudad      AS company_ciudad
FROM jobs j
JOIN companies c ON c.id = j.company_id
WHERE j.status = 'activa' AND c.status = 'aprobada';

-- ============================================================
-- DATOS INICIALES (opcional — solo para desarrollo)
-- ============================================================
-- Para crear el primer admin, registra un usuario normal y luego
-- ejecuta en SQL Editor:
--
-- UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
