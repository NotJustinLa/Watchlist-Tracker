/**
 * Loading state for follow requests.
 */

import { Skeleton } from '@/components/Skeleton';

/**
 * Placeholder rows with avatars.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading requests"
      className="flex max-w-2xl flex-col gap-4"
    >
      <Skeleton className="h-7.5 w-52" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton rounded="full" className="size-10" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
