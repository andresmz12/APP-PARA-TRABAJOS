export type UserRole = 'admin' | 'empresa' | 'candidato';
export type CompanyStatus = 'pendiente' | 'aprobada' | 'rechazada';
export type JobStatus = 'activa' | 'pausada' | 'cerrada';
export type ApplicationStatus = 'pendiente' | 'contactado' | 'rechazado';
export type JobArea =
  | 'limpieza'
  | 'logistica'
  | 'ventas'
  | 'administracion'
  | 'construccion'
  | 'seguridad'
  | 'cocina'
  | 'tecnologia'
  | 'salud'
  | 'educacion'
  | 'manufactura'
  | 'otro';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  nombre: string;
  telefono?: string;
  ciudad?: string;
  experiencia_previa?: string;
  habilidades: string[];
  tiene_vehiculo: boolean;
  tiene_moto: boolean;
  dias_disponibles: string[];
  turno_preferido?: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  nombre: string;
  descripcion?: string;
  ciudad?: string;
  sitio_web?: string;
  telefono?: string;
  status: CompanyStatus;
  verificada: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  titulo: string;
  area: JobArea;
  cargo: string;
  descripcion: string;
  salario_min?: number;
  salario_max?: number;
  horario: string;
  ubicacion: string;
  modalidad: string;
  requisitos: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  nota_empresa?: string;
  created_at: string;
  updated_at: string;
  job?: Job & { company?: Company };
  candidate?: CandidateProfile & { profile?: Profile };
}

// ---- Etiquetas de display ----

export const JOB_AREAS: Record<JobArea, string> = {
  limpieza: 'Limpieza',
  logistica: 'Logística',
  ventas: 'Ventas',
  administracion: 'Administración',
  construccion: 'Construcción',
  seguridad: 'Seguridad',
  cocina: 'Cocina / Alimentos',
  tecnologia: 'Tecnología',
  salud: 'Salud',
  educacion: 'Educación',
  manufactura: 'Manufactura',
  otro: 'Otro',
};

export const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const TURNOS = ['Mañana', 'Tarde', 'Noche', 'Rotativo', 'Flexible'];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pendiente: 'Pendiente',
  contactado: 'Contactado',
  rechazado: 'Rechazado',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  cerrada: 'Cerrada',
};

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};
