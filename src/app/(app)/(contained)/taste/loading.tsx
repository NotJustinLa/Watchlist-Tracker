import { Skeleton } from '@/components/Skeleton';
import { RecommendationSkeletons } from './TasteGenerator';

export default function Loading() {
  return (
    <>
      <Skeleton className="h-7.5 w-28" />
      <Skeleton rounded="lg" className="h-44" />
      <RecommendationSkeletons />
    </>
  );
}
