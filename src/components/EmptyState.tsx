/**
 * What a list shows when there's nothing in it yet.
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
};

/**
 * An icon, a short title, a sentence of help and at most one button pointing
 * you to where to fix it.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="mb-1 flex size-14 items-center justify-center rounded-full border border-line bg-surface text-muted">
        <Icon size={24} aria-hidden />
      </span>
      <h2 className="text-title">{title}</h2>
      {body && <p className="max-w-75 text-body-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
