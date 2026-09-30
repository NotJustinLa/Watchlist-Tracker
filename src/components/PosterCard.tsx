import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookmarkCheck, Film, Star } from 'lucide-react';

type PosterProps = {
  url: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function Poster({ url, sizes, priority, className = '' }: PosterProps) {
  return (
    <div
      className={`relative aspect-2/3 overflow-hidden rounded-lg bg-raised after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-ink/5 after:ring-inset ${className}`}
    >
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <Film
          size={28}
          aria-hidden
          className="absolute inset-0 m-auto text-muted"
        />
      )}
    </div>
  );
}

type PosterCardProps = {
  title: string;
  year: number | null;
  posterUrl: string | null;
  href: string;
  /** Your rating (1–5), shown as filled stars on the poster. */
  rating?: number;
  watchlisted?: boolean;
  /** A control over the poster's top-right corner (e.g. remove), kept outside the link. */
  action?: ReactNode;
};

export function PosterCard({
  title,
  year,
  posterUrl,
  href,
  rating,
  watchlisted,
  action,
}: PosterCardProps) {
  return (
    <div className="relative min-w-0">
      <Link
        href={href}
        className="group flex min-w-0 flex-col gap-2 focus-visible:outline-none"
      >
        <div className="relative rounded-lg transition group-hover:-translate-y-0.5 group-hover:shadow-poster group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent">
          <Poster
            url={posterUrl}
            sizes="(min-width: 1280px) 200px, (min-width: 1024px) 20vw, (min-width: 640px) 25vw, 33vw"
          />
          {rating ? (
            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-scrim px-1.75 py-1 backdrop-blur-sm">
              {Array.from({ length: rating }, (_, i) => (
                <Star
                  key={i}
                  size={11}
                  aria-hidden
                  className="fill-accent text-accent"
                />
              ))}
              <span className="sr-only">{`Your rating: ${rating} out of 5`}</span>
            </span>
          ) : null}
          {watchlisted && !action && (
            <span className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-scrim backdrop-blur-sm">
              <BookmarkCheck size={15} aria-hidden />
              <span className="sr-only">On your watchlist</span>
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-bold">{title}</span>
          {year && <span className="text-caption text-muted">{year}</span>}
        </div>
      </Link>
      {action && <div className="absolute top-1.5 right-1.5">{action}</div>}
    </div>
  );
}
