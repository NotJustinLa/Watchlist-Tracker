'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck, Check, CircleAlert, Eye } from 'lucide-react';
import { Button } from '@/components/Button';
import { StarRating, type Rating } from '@/components/StarRating';
import type { ActionError } from '@/lib/validation';
import { setOnWatchlist, setWatched } from './actions';

type State = { watched: boolean; rating: Rating; onWatchlist: boolean };

export function MovieActions({ tmdbId, ...saved }: State & { tmdbId: number }) {
  const [state, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  // Shows `next` immediately; when the action settles the page re-renders with
  // saved state, so a failure reverts on its own.
  function run(next: State, action: () => Promise<ActionError | void>) {
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      try {
        if (await action()) setFailed(true);
      } catch {
        setFailed(true);
      }
    });
  }

  function toggleWatched() {
    const watched = !state.watched;
    run(
      {
        watched,
        rating: watched ? state.rating : 0,
        onWatchlist: watched ? false : state.onWatchlist,
      },
      () => setWatched(tmdbId, watched),
    );
  }

  function toggleWatchlist() {
    const onWatchlist = !state.onWatchlist;
    run({ ...state, onWatchlist }, () => setOnWatchlist(tmdbId, onWatchlist));
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 md:p-6">
      <div className="grid gap-2 xl:grid-cols-2">
        <Button
          on={state.onWatchlist}
          icon={state.onWatchlist ? BookmarkCheck : Bookmark}
          onClick={toggleWatchlist}
        >
          {state.onWatchlist ? 'On watchlist' : 'Add to watchlist'}
        </Button>
        <Button
          on={state.watched}
          icon={state.watched ? Check : Eye}
          onClick={toggleWatched}
        >
          {state.watched ? 'Watched' : 'Mark as watched'}
        </Button>
      </div>
      {state.watched && (
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-body-sm text-muted">
          {state.rating ? (
            <StarRating value={state.rating} />
          ) : (
            <span>Not rated yet</span>
          )}
          <Link
            href={state.rating ? '/watched' : '/watched?stars=unrated'}
            className="font-bold text-ink hover:underline"
          >
            {state.rating ? 'Change in Watched' : 'Rate it in Watched'}
          </Link>
        </div>
      )}
      {failed && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-body-sm text-negative"
        >
          <CircleAlert size={16} aria-hidden />
          Couldn’t save that. Try again.
        </p>
      )}
    </div>
  );
}
