'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck, CircleAlert } from 'lucide-react';
import { Button } from '@/components/Button';
import { StarRating, type Rating } from '@/components/StarRating';
import { rateMovie, removeRating, setOnWatchlist } from './actions';

type State = { rating: Rating; onWatchlist: boolean };

export function MovieActions({ tmdbId, ...saved }: State & { tmdbId: number }) {
  const [state, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  // Shows `next` immediately; when the action settles the page re-renders with
  // saved state, so a failure reverts on its own.
  function run(next: State, action: () => Promise<void>) {
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      try {
        await action();
      } catch {
        setFailed(true);
      }
    });
  }

  function rate(rating: Rating) {
    run({ rating, onWatchlist: rating ? false : state.onWatchlist }, () =>
      rating ? rateMovie(tmdbId, rating) : removeRating(tmdbId),
    );
  }

  function toggleWatchlist() {
    const onWatchlist = !state.onWatchlist;
    run({ ...state, onWatchlist }, () => setOnWatchlist(tmdbId, onWatchlist));
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 md:p-6">
      <Button
        on={state.onWatchlist}
        icon={state.onWatchlist ? BookmarkCheck : Bookmark}
        onClick={toggleWatchlist}
        className="w-full"
      >
        {state.onWatchlist ? 'On watchlist' : 'Add to watchlist'}
      </Button>
      <div className="border-t border-line pt-3">
        <StarRating value={state.rating} onChange={rate} />
      </div>
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
