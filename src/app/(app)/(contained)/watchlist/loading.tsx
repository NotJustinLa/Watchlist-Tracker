import { PosterGridSkeleton, Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <>
      <Skeleton className="h-7.5 w-44" />
      <PosterGridSkeleton />
    </>
  );
}
