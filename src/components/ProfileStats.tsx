/**
 * The stats card on a profile.
 */

type ProfileStatsProps = {
  watched: number;
  /** Average of rated films, or null if none are rated. */
  average: number | null;
  /** Count of films rated 1–5 stars. */
  distribution: number[];
};

/**
 * Films watched, average rating and a small chart of how many films got each
 * star rating.
 *
 * The bars are grey and white, not yellow, because they're data rather than a
 * rating.
 */
export function ProfileStats({
  watched,
  average,
  distribution,
}: ProfileStatsProps) {
  const max = Math.max(...distribution, 1);
  const summary = distribution
    .map((count, i) => `${i + 1} star${i ? 's' : ''}: ${count}`)
    .join(', ');

  return (
    <section
      aria-label="Stats"
      className="flex flex-wrap items-end gap-x-8 gap-y-4 rounded-lg border border-line bg-surface p-4 md:p-6"
    >
      <div className="flex flex-col">
        <span className="text-title-lg">{watched}</span>
        <span className="text-overline text-muted uppercase">Watched</span>
      </div>
      <div className="flex flex-col">
        <span className="text-title-lg">{average?.toFixed(1) ?? '–'}</span>
        <span className="text-overline text-muted uppercase">Avg rating</span>
      </div>
      <figure className="flex flex-col gap-1.5">
        <div
          role="img"
          aria-label={`Ratings given: ${summary}`}
          className="flex h-12 items-end gap-1.5"
        >
          {distribution.map((count, i) => (
            <span
              key={i}
              style={{ height: `${Math.max((count / max) * 100, 6)}%` }}
              className={`w-4 rounded-t-xs ${count === max && count > 0 ? 'bg-ink' : 'bg-muted'}`}
            />
          ))}
        </div>
        <figcaption
          aria-hidden
          className="flex gap-1.5 text-caption text-muted"
        >
          {distribution.map((_, i) => (
            <span key={i} className="w-4 text-center">
              {i + 1}
            </span>
          ))}
        </figcaption>
      </figure>
    </section>
  );
}
