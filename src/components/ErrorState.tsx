/**
 * What a page shows when it couldn't load.
 */

'use client';

import { useTransition } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

type ErrorStateProps = {
  onRetry: () => void;
  title?: string;
  body?: string;
};

/**
 * A red icon, what went wrong, and a Try again button that shows it's working
 * while it retries.
 */
export function ErrorState({
  onRetry,
  title = 'Couldn’t load films',
  body = 'The movie database didn’t respond. Check your connection and try again.',
}: ErrorStateProps) {
  const [retrying, startTransition] = useTransition();
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 px-6 py-12 text-center"
    >
      <span className="mb-1 flex size-14 items-center justify-center rounded-full border border-line bg-surface text-negative">
        <WifiOff size={24} aria-hidden />
      </span>
      <h2 className="text-title">{title}</h2>
      <p className="max-w-75 text-body-sm text-muted">{body}</p>
      <Button
        icon={RefreshCw}
        loading={retrying}
        onClick={() => startTransition(onRetry)}
        className="mt-2"
      >
        {retrying ? 'Retrying' : 'Try again'}
      </Button>
    </div>
  );
}
