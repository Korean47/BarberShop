import { EmptyState } from '../components/ui/EmptyState';

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Settings</h2>
          <p className="text-slate-400">Configure your barbershop preferences.</p>
        </div>
      </div>
      <EmptyState
        icon="settings"
        title="Coming Soon"
        description="Shop settings functionality will be available in the next release."
      />
    </div>
  );
}
