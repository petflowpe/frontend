/**
 * Estado vacío reutilizable: ilustración + mensaje + CTA
 */

import { ReactNode } from 'react';
import { Button } from './ui/button';
import { FileQuestion, Inbox, Calendar, Users, Package } from 'lucide-react';

const ICONS = {
  default: FileQuestion,
  inbox: Inbox,
  calendar: Calendar,
  users: Users,
  package: Package,
} as const;

interface EmptyStateProps {
  icon?: keyof typeof ICONS;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = 'default',
  title,
  description,
  actionLabel,
  onAction,
  children,
  className = '',
}: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-8 text-center min-h-[200px] ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
        <Icon className="h-10 w-10 text-slate-400 dark:text-slate-500" aria-hidden />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      )}
      {children}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
