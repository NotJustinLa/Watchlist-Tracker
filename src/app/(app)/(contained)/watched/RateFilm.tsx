/**
 * The small stars under each poster on your Watched page.
 */

'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { StarRating, type Rating } from '@/components/StarRating';
import { rateMovie } from '@/app/(app)/movie/[id]/actions';

/**
 * Lets you rate (or clear) a film right in the grid. The stars change instantly
 * and undo themselves if saving fails.
 */
export function RateFilm({
  tmdbId,
  title,
  rating,
}: {
  tmdbId: number;
  title: string;
  rating: Rating;
}) {
  const [value, setOptimistic] = useOptimistic(rating);
  const [, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function rate(next: Rating) {
    setFailed(false);
    startTransition(async () => {
      setOptimistic(next);
      try {
        if (await rateMovie(tmdbId, next || null)) setFailed(true);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <>
      <StarRating
        value={value}
        onChange={rate}
        label={`Your rating for ${title}`}
        compact
      />
      {failed && (
        <p role="alert" className="text-caption text-negative">
          Couldn’t save. Try again.
        </p>
      )}
    </>
  );
}
