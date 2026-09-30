import { PosterGrid } from './PosterGrid';

const radii = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

type SkeletonProps = {
  className?: string;
  rounded?: keyof typeof radii;
};

export function Skeleton({ className = '', rounded = 'sm' }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`bg-raised motion-safe:animate-skeleton ${radii[rounded]} ${className}`}
    />
  );
}

const titleWidths = ['w-4/5', 'w-3/5', 'w-11/12', 'w-2/3'];

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading films">
      <PosterGrid>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton rounded="lg" className="aspect-2/3" />
            <Skeleton
              className={`h-3.5 ${titleWidths[i % titleWidths.length]}`}
            />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </PosterGrid>
    </div>
  );
}
