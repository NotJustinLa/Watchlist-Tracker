/**
 * Loading state for your Watched page.
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
