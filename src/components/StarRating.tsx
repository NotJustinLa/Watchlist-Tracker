/**
 * Star ratings, for showing and for choosing.
 */

'use client';

import { useId, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './Button';

export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

const stars = [1, 2, 3, 4, 5] as const;
const words = [
  'Didn’t like it',
  'It was OK',
  'Liked it',
  'Really liked it',
  'Loved it',
];

/**
 * One star, filled yellow when it's part of the rating and outlined when it
 * isn't.
 *
 * When `pop` is set (the stars you can tap), a star gives a small springy pop
 * the moment it fills in.
 */
function StarIcon({
  filled,
  size,
  pop = false,
}: {
  filled: boolean;
  size: number;
  pop?: boolean;
}) {
  return (
    <Star
      size={size}
      strokeWidth={size > 20 ? 1.75 : 2}
      aria-hidden
      className={`transition-colors ${filled ? `fill-accent text-accent ${pop ? 'animate-pop' : ''}` : 'text-line-strong'}`}
    />
  );
}

type StarRatingProps = {
  value: Rating;
  onChange?: (value: Rating) => void;
  label?: string;
  /** Small stars only, for poster grids: no hint text or Clear (tap the current star to clear). */
  compact?: boolean;
};

/**
 * Shows a rating, or lets you pick one when you pass onChange.
 *
 * You can tap a star, use the arrow keys, or tap your current star again to
 * clear it. The compact version is small enough to sit under a poster.
 */
export function StarRating({
  value,
  onChange,
  label = 'Your rating',
  compact = false,
}: StarRatingProps) {
  const name = useId();
  const [preview, setPreview] = useState<Rating>(0);

  if (!onChange) {
    return (
      <span
        role="img"
        aria-label={`${value} out of 5 stars`}
        className="inline-flex gap-0.5"
      >
        {stars.map((n) => (
          <StarIcon key={n} filled={n <= value} size={14} />
        ))}
      </span>
    );
  }

  const shown = preview || value;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{label}</legend>
      <div
        className={compact ? 'flex' : '-ml-1.5 flex gap-0.5'}
        onPointerLeave={() => setPreview(0)}
      >
        {stars.map((n) => (
          <label
            key={n}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview(n)}
            className={`flex cursor-pointer items-center justify-center rounded-md transition-transform active:scale-90 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${compact ? 'size-5' : 'size-11'}`}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              onClick={() => value === n && onChange(0)}
              className="sr-only"
            />
            <span className="sr-only">{`${n} star${n > 1 ? 's' : ''}`}</span>
            <StarIcon filled={n <= shown} size={compact ? 16 : 30} pop />
          </label>
        ))}
      </div>
      {!compact && (
        <div className="flex min-h-9 items-center gap-3 text-body-sm text-muted">
          {value === 0 ? (
            'Unrated · tap a star to rate'
          ) : (
            <>
              {words[value - 1]}
              <Button variant="ghost" size="sm" onClick={() => onChange(0)}>
                Clear
              </Button>
            </>
          )}
        </div>
      )}
    </fieldset>
  );
}
