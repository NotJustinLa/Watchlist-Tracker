/**
 * Error state shared by every standard page.
 *
 * If something on Search, your lists, Taste, Feed or a profile fails to load,
 * you see this instead of a broken page, with a button to try again. The
 * wording stays general because it covers so many pages.
 */

'use client';

import { ErrorState } from '@/components/ErrorState';

/**
 * Tells you the page didn't load and lets you retry it.
 */
export default function Error({ retry }: { retry: () => void }) {
  return (
    <ErrorState
      onRetry={retry}
      title="This page didn’t load"
      body="Something went wrong on our side or with your connection. Try again."
    />
  );
}
