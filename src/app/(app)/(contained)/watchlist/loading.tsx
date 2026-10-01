/**
 * Loading state for your watchlist.
 */

import { PosterGridSkeleton, Skeleton } from '@/components/Skeleton';

/**
 * A heading placeholder and a grid of poster outlines.
 */
export default function Loading() {
  return (
    <>
      <Skeleton className="h-7.5 w-44" />
      <PosterGridSkeleton />
    </>
  );
}
