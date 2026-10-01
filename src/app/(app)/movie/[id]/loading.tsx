/**
 * Loading state for the movie page.
 *
 * You see placeholders in the shape of the backdrop, poster, title and overview
 * while the film loads.
 */

import { Skeleton } from '@/components/Skeleton';

/**
 * Placeholder backdrop, poster and text lines.
 */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading film">
      <Skeleton rounded="none" className="h-55 md:h-90" />
      <div className="relative mx-auto -mt-24 flex max-w-content items-end gap-4 px-4 md:-mt-45 md:gap-8 md:px-8">
        <Skeleton rounded="lg" className="aspect-2/3 w-29 flex-none md:w-55" />
        <div className="flex flex-1 flex-col gap-2.5 pb-1">
          <Skeleton className="h-6.5 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-1.5">
            <Skeleton rounded="full" className="h-6.5 w-14" />
            <Skeleton rounded="full" className="h-6.5 w-18" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-content flex-col gap-2 px-4 pt-6 md:px-8 md:pt-8">
        <Skeleton className="h-3" />
        <Skeleton className="h-3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
