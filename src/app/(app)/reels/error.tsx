/**
 * Error state for Reels.
 */

'use client';

import { ErrorState } from '@/components/ErrorState';

/**
 * Tells you the films couldn't be loaded and lets you retry.
 */
export default function Error({ retry }: { retry: () => void }) {
  return <ErrorState onRetry={retry} />;
}
