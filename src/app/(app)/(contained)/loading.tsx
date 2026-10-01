/**
 * Loading state for the Search page.
 *
 * While films are on their way you see the shape of the page (a search box and
 * a grid of poster outlines) instead of a blank screen.
 */

import { PosterGridSkeleton, Skeleton } from '@/components/Skeleton';

/**
 * A search box and poster grid made of placeholders.
 */
export default function Loading() {
  return (
    <>
      <Skeleton rounded="md" className="h-11" />
      <PosterGridSkeleton />
    </>
  );
}
