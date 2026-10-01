/**
 * Loading state for the Feed.
 */

import { Skeleton } from '@/components/Skeleton';

/**
 * Placeholder activity rows with avatars and poster thumbnails.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading activity"
      className="flex max-w-2xl flex-col gap-4"
    >
      <Skeleton className="h-7.5 w-32" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton rounded="full" className="size-10" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="aspect-2/3 w-12" />
        </div>
      ))}
    </div>
  );
}
