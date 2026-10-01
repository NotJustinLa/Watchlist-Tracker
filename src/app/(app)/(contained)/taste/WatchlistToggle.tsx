'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/Button';
import { setOnWatchlist } from '@/app/(app)/movie/[id]/actions';

export function WatchlistToggle({
  tmdbId,
  on,
}: {
  tmdbId: number;
  on: boolean;
}) {
  const [onWatchlist, setOptimistic] = useOptimistic(on);
  const [, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function toggle() {
    const next = !onWatchlist;
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      try {
        await setOnWatchlist(tmdbId, next);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <Button
      size="sm"
      on={onWatchlist}
      icon={onWatchlist ? BookmarkCheck : Bookmark}
      onClick={toggle}
    >
      {failed
        ? 'Couldn’t save, try again'
        : onWatchlist
          ? 'On watchlist'
          : 'Add to watchlist'}
    </Button>
  );
}
