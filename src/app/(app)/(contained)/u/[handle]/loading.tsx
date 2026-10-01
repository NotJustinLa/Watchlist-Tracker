/**
 * Loading state for a profile.
 */

import { Skeleton } from '@/components/Skeleton';

/**
 * Placeholders for the name and handle.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="flex flex-col gap-2"
    >
      <Skeleton className="h-7.5 w-48" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}
