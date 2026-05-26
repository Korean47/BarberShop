import type { AppointmentStatus } from '../../types';

interface BadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'badge-confirmed' },
  pending: { label: 'Pending', className: 'badge-pending' },
  cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
  completed: { label: 'Completed', className: 'badge-completed' },
};

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
