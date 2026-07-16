import type { AppointmentStatus } from '../../types';

interface BadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'badge-confirmed' },
  pending: { label: 'Pendiente', className: 'badge-pending' },
  cancelled: { label: 'Cancelada', className: 'badge-cancelled' },
  completed: { label: 'Completada', className: 'badge-completed' },
  checked_in: { label: 'En recepción', className: 'badge-confirmed' },
  in_progress: { label: 'En servicio', className: 'badge-pending' },
  no_show: { label: 'No asistió', className: 'badge-cancelled' },
};

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
