/**
 * Film posters as they appear in grids.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookmarkCheck, Film, Star } from 'lucide-react';
import { Avatar } from './Avatar';

type PosterProps = {
  url: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Just the poster image in its rounded frame, or a film icon if the film has no
 * poster.
 */
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
  /** People you follow who watched this film. */
  friends?: { handle: string; displayName: string; avatarUrl: string | null }[];
  /** A control over the poster's top-right corner (e.g. remove), kept outside the link. */
  action?: ReactNode;
  /** Content under the title (e.g. a rating input), kept outside the link. */
  footer?: ReactNode;
};

/**
 * A poster with its title and year, linking to the film.
 *
 * It can also show your rating, a watchlist mark, a stack of friends who
 * watched it, a button in the corner (like remove) and something underneath
 * (like stars).
 */
export function PosterCard({
  title,
  year,
  posterUrl,
  href,
  rating,
  watchlisted,
  friends = [],
  action,
  footer,
}: PosterCardProps) {
  return (
    <div className="relative min-w-0">
      <Link
        href={href}
        className="group flex min-w-0 flex-col gap-2 focus-visible:outline-none"
      >
        <div className="relative rounded-lg transition group-hover:-translate-y-0.5 group-hover:shadow-poster group-active:scale-97 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent">
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
          {friends.length > 0 && (
            <span className="absolute top-1.5 left-1.5 flex items-center rounded-full bg-scrim p-0.5 backdrop-blur-sm">
              {friends.slice(0, 3).map((friend, i) => (
                <span
                  key={friend.handle}
                  className={`rounded-full ring-2 ring-scrim ${i ? '-ml-1.5' : ''}`}
                >
                  <Avatar
                    name={friend.displayName}
                    url={friend.avatarUrl}
                    size="xs"
                  />
                </span>
              ))}
              {friends.length > 3 && (
                <span aria-hidden className="px-1 text-[10px] font-extrabold">
                  +{friends.length - 3}
                </span>
              )}
              <span className="sr-only">
                {`${friends.length} ${friends.length === 1 ? 'person' : 'people'} you follow watched this`}
              </span>
            </span>
          )}
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
      {footer && <div className="mt-1.5">{footer}</div>}
    </div>
  );
}
