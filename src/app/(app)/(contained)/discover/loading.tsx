import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-3">
      <Skeleton className="h-7.5 w-56" />
      <Skeleton rounded="md" className="h-11" />
    </div>
  );
}
