import { EmptyState } from '../components/ui/EmptyState';

export function AdminBarbers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Barbers</h2>
          <p className="text-slate-400">Manage your team and their schedules.</p>
        </div>
      </div>
      <EmptyState
        icon="users"
        title="Coming Soon"
        description="Barber management functionality will be available in the next release."
      />
    </div>
  );
}
