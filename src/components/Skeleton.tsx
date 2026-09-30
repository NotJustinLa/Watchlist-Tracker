import { PosterGrid } from './PosterGrid';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`rounded-sm bg-raised motion-safe:animate-skeleton ${className}`}
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
            <Skeleton className="aspect-2/3 rounded-lg" />
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
