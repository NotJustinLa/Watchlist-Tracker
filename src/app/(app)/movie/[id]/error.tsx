/**
 * Error state for the movie page.
 *
 * If the movie database doesn't answer, you see this with a button to try
 * again.
 */

'use client';

import { ErrorState } from '@/components/ErrorState';

/**
 * Tells you the film couldn't be loaded and lets you retry.
 */
export default function Error({ retry }: { retry: () => void }) {
  return (
    <ErrorState
      onRetry={retry}
      title="Couldn’t load this film"
      body="The movie database didn’t respond. Check your connection and try again."
    />
  );
}
