import { Calendar, Inbox, Users, Settings } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'calendar' | 'inbox' | 'users' | 'settings';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  calendar: Calendar,
  inbox: Inbox,
  users: Users,
  settings: Settings,
};

export function EmptyState({
  title,
  description,
  icon = 'inbox',
  action,
}: EmptyStateProps) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
