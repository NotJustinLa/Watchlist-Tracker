import { PosterGridSkeleton, Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <>
      <Skeleton rounded="md" className="h-11" />
      <PosterGridSkeleton />
    </>
  );
}
