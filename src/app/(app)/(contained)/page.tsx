/**
 * Search page: the home page (`/`).
 *
 * This is where you land after signing in. Type in the box and matching films
 * appear; leave it empty and you see what's popular right now. Each poster
 * shows your rating, whether it's on your watchlist, and who you follow has
 * watched it.
 */

import { Suspense } from 'react';
import { SearchX } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PosterCard } from '@/components/PosterCard';
import { PosterGrid } from '@/components/PosterGrid';
import { SearchInput } from '@/components/SearchInput';
import { PosterGridSkeleton } from '@/components/Skeleton';
import { getFriendsWhoWatched } from '@/lib/friends';
import { getMyFilmStates } from '@/lib/my-films';
import { getPopular, searchMovies } from '@/lib/tmdb';
import { searchQuerySchema } from '@/lib/validation';

/**
 * Shows the search box and, below it, the results for whatever is in the
 * address bar's `?q=`.
 */
export default async function SearchPage({ searchParams }: PageProps<'/'>) {
  const query = searchQuerySchema.parse((await searchParams).q);

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-title-lg md:sr-only">Search</h1>
        <SearchInput defaultValue={query} />
      </div>
      <Suspense key={query} fallback={<PosterGridSkeleton />}>
        <Results query={query} />
      </Suspense>
    </>
  );
}

/**
 * Fetches the films for your search (or the popular list) and lays them out as
 * posters.
 *
 * Your ratings, watchlist marks and friends' avatars are looked up in one go
 * for every poster on screen, rather than one at a time.
 */
async function Results({ query }: { query: string }) {
  const movies = query ? await searchMovies(query) : await getPopular();
  const ids = movies.map((movie) => movie.id);
  const [mine, friends] = await Promise.all([
    getMyFilmStates(ids),
    getFriendsWhoWatched(ids),
  ]);

  if (query && movies.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No films match “${query}”`}
        body="Check the spelling, or try the original title or the year."
      />
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title">
        {query ? (
          <>
            Results{' '}
            <span className="font-semibold text-muted">{movies.length}</span>
          </>
        ) : (
          'Popular right now'
        )}
      </h2>
      <PosterGrid>
        {movies.map((movie) => (
          <PosterCard
            key={movie.id}
            title={movie.title}
            year={movie.year}
            posterUrl={movie.posterUrl}
            href={`/movie/${movie.id}`}
            rating={mine.watched.get(movie.id) ?? undefined}
            watchlisted={mine.watchlist.has(movie.id)}
            friends={friends.get(movie.id)}
          />
        ))}
      </PosterGrid>
    </section>
  );
}
