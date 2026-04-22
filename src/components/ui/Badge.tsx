import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import type {
  ApplicationStatus,
  CompanyStatus,
  JobStatus,
} from '@/lib/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'blue'
    | 'purple';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pendiente: { label: 'Pendiente', variant: 'warning' },
    contactado: { label: 'Contactado', variant: 'success' },
    rechazado: { label: 'Rechazado', variant: 'danger' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; variant: BadgeProps['variant'] }> = {
    activa: { label: 'Activa', variant: 'success' },
    pausada: { label: 'Pausada', variant: 'warning' },
    cerrada: { label: 'Cerrada', variant: 'default' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  const map: Record<CompanyStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pendiente: { label: 'Pendiente', variant: 'warning' },
    aprobada: { label: 'Aprobada', variant: 'success' },
    rechazada: { label: 'Rechazada', variant: 'danger' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
