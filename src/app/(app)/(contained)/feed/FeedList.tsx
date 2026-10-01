/**
 * The list of activity on the Feed page, with its Load more button.
 */

'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Poster } from '@/components/PosterCard';
import { StarRating, type Rating } from '@/components/StarRating';
import type { FeedEvent } from '@/lib/feed';
import { relativeTime } from '@/lib/relative-time';

/**
 * Shows the activity you've loaded so far and fetches the next 20 when you
 * press Load more.
 */
export function FeedList({
  initial,
  pageSize,
}: {
  initial: FeedEvent[];
  pageSize: number;
}) {
  const [events, setEvents] = useState(initial);
  const [more, setMore] = useState(initial.length === pageSize);
  const [failed, setFailed] = useState(false);
  const [loading, startTransition] = useTransition();

  function loadMore() {
    const before = events.at(-1)?.at;
    if (!before) return;
    setFailed(false);
    startTransition(async () => {
      const res = await fetch(
        `/api/feed?before=${encodeURIComponent(before)}`,
      ).catch(() => null);
      if (!res?.ok) {
        setFailed(true);
        return;
      }
      const { events: next }: { events: FeedEvent[] } = await res.json();
      setEvents((current) => [...current, ...next]);
      setMore(next.length === pageSize);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <ul className="stagger">
        {events.map((event) => (
          <FeedItem
            key={`${event.kind}-${event.handle}-${event.tmdbId}`}
            event={event}
          />
        ))}
      </ul>
      {failed && (
        <p role="alert" className="text-body-sm text-negative">
          Couldn’t load more activity. Try again.
        </p>
      )}
      {more && (
        <Button loading={loading} onClick={loadMore} className="self-center">
          Load more
        </Button>
      )}
    </div>
  );
}

/**
 * One line of activity, such as "@maya watched Past Lives (5 stars), 2h ago",
 * with the poster beside it.
 */
function FeedItem({ event }: { event: FeedEvent }) {
  const movieHref = `/movie/${event.tmdbId}`;
  return (
    <li className="flex items-start gap-3 border-b border-line py-3 last:border-b-0">
      <Link href={`/u/${event.handle}`} aria-hidden tabIndex={-1}>
        <Avatar name={event.displayName} url={event.avatarUrl} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p>
          <Link
            href={`/u/${event.handle}`}
            className="font-bold hover:underline"
          >
            @{event.handle}
          </Link>{' '}
          {event.kind === 'watched' ? 'watched' : 'added'}{' '}
          <Link href={movieHref} className="font-bold hover:underline">
            {event.title}
          </Link>
          {event.kind === 'watchlist' && ' to their watchlist'}
        </p>
        {event.rating ? <StarRating value={event.rating as Rating} /> : null}
        <time
          dateTime={event.at}
          suppressHydrationWarning
          className="text-caption text-muted"
        >
          {relativeTime(event.at)}
        </time>
      </div>
      <Link
        href={movieHref}
        aria-hidden
        tabIndex={-1}
        className="w-12 flex-none"
      >
        <Poster url={event.posterUrl} sizes="48px" />
      </Link>
    </li>
  );
}
