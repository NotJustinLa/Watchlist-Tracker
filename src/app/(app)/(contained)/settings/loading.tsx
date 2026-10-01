/**
 * Loading state for Settings.
 */

import { Skeleton } from '@/components/Skeleton';

/**
 * Placeholders for the form fields.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading settings"
      className="flex max-w-lg flex-col gap-6"
    >
      <Skeleton className="h-7.5 w-36" />
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton rounded="md" className="h-11" />
        </div>
      ))}
      <Skeleton rounded="lg" className="h-24" />
    </div>
  );
}
