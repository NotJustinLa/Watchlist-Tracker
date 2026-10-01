import Link from 'next/link';
import { Eye, SearchX, Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Poster } from '@/components/PosterCard';
import { MIN_RATINGS } from '@/lib/gemini';
import { getMyFilmStates } from '@/lib/my-films';
import { createClient } from '@/lib/supabase/server';
import { storedRecommendationsSchema } from '@/lib/validation';
import { TasteGenerator } from './TasteGenerator';
import { WatchlistToggle } from './WatchlistToggle';

export default async function TastePage() {
  // RLS limits both reads to the signed-in user's own rows.
  const supabase = await createClient();
  const [watched, saved] = await Promise.all([
    supabase.from('watched').select('tmdb_id, rating'),
    supabase
      .from('taste_profiles')
      .select('summary, recommendations, rating_count')
      .maybeSingle(),
  ]);
  if (watched.error) throw watched.error;
  if (saved.error) throw saved.error;

  // Only rated films count towards the profile; unrated ones are still hidden from picks.
  const ratingCount = watched.data.filter((row) => row.rating !== null).length;
  const heading = <h1 className="text-title-lg">Taste</h1>;

  if (ratingCount < MIN_RATINGS) {
    const needed = MIN_RATINGS - ratingCount;
    return (
      <>
        {heading}
        <EmptyState
          icon={Sparkles}
          title={`Rate ${needed} more film${needed === 1 ? '' : 's'}`}
          body={`Your taste profile needs at least ${MIN_RATINGS} ratings to find patterns. You have ${ratingCount}.`}
          action={
            <div className="flex flex-col items-center gap-4">
              <div
                role="progressbar"
                aria-label="Ratings so far"
                aria-valuenow={ratingCount}
                aria-valuemax={MIN_RATINGS}
                className="h-1.5 w-50 overflow-hidden rounded-full bg-raised"
              >
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${(ratingCount / MIN_RATINGS) * 100}%` }}
                />
              </div>
              <ButtonLink href="/watched" icon={Eye}>
                Rate films you’ve watched
              </ButtonLink>
            </div>
          }
        />
      </>
    );
  }

  // Hide picks the user has watched since the profile was generated.
  const watchedIds = new Set(watched.data.map((row) => row.tmdb_id));
  const recommendations = saved.data
    ? storedRecommendationsSchema
        .parse(saved.data.recommendations)
        .filter((rec) => !watchedIds.has(rec.tmdbId))
    : [];
  const { watchlist } = await getMyFilmStates(
    recommendations.map((rec) => rec.tmdbId),
  );

  return (
    <>
      {heading}
      <TasteGenerator
        profile={
          saved.data && {
            summary: saved.data.summary,
            ratingCount: saved.data.rating_count,
            newRatings: ratingCount - saved.data.rating_count,
          }
        }
      >
        {saved.data &&
          (recommendations.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-title">Picked for you</h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {recommendations.map((rec) => (
                  <li
                    key={rec.tmdbId}
                    className="flex gap-4 rounded-lg border border-line bg-surface p-3"
                  >
                    <Link
                      href={`/movie/${rec.tmdbId}`}
                      aria-hidden
                      tabIndex={-1}
                      className="w-19 flex-none"
                    >
                      <Poster url={rec.posterUrl} sizes="76px" />
                    </Link>
                    <div className="flex min-w-0 flex-col items-start gap-1">
                      <Link
                        href={`/movie/${rec.tmdbId}`}
                        className="text-label hover:underline"
                      >
                        {rec.title}
                      </Link>
                      {rec.year && (
                        <span className="text-caption text-muted">
                          {rec.year}
                        </span>
                      )}
                      <p className="text-body-sm text-muted">{rec.reason}</p>
                      <div className="mt-auto pt-2">
                        <WatchlistToggle
                          tmdbId={rec.tmdbId}
                          on={watchlist.has(rec.tmdbId)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No picks this time"
              body="None of the suggested films matched a real title you haven’t seen. Regenerate for a fresh set."
            />
          ))}
      </TasteGenerator>
    </>
  );
}
