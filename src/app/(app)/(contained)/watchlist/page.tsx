import { Bookmark, Search } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PosterCard } from '@/components/PosterCard';
import { PosterGrid } from '@/components/PosterGrid';
import { Segmented } from '@/components/Segmented';
import { getFriendsWhoWatched } from '@/lib/friends';
import { createClient } from '@/lib/supabase/server';
import { posterUrl } from '@/lib/tmdb';
import { watchlistSortSchema } from '@/lib/validation';
import { RemoveButton } from './RemoveButton';

export default async function WatchlistPage({
  searchParams,
}: PageProps<'/watchlist'>) {
  const sort = watchlistSortSchema.parse((await searchParams).sort);

  // RLS limits this to the signed-in user's rows.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('watchlist_items')
    .select('movies(tmdb_id, title, poster_path, release_year)')
    .order('added_at', { ascending: false });
  if (error) throw error;

  const films = data.map((row) => row.movies);
  if (sort === 'title') films.sort((a, b) => a.title.localeCompare(b.title));
  const friends = await getFriendsWhoWatched(films.map((film) => film.tmdb_id));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title-lg">
          Watchlist{' '}
          <span className="font-semibold text-muted">{films.length}</span>
        </h1>
        {films.length > 0 && (
          <Segmented
            label="Sort"
            options={[
              {
                label: 'Date added',
                href: '/watchlist',
                active: sort === 'added',
              },
              {
                label: 'Title',
                href: '/watchlist?sort=title',
                active: sort === 'title',
              },
            ]}
          />
        )}
      </div>

      {films.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          body="Save films you want to see and they will wait for you here."
          action={
            <ButtonLink href="/" icon={Search}>
              Browse popular films
            </ButtonLink>
          }
        />
      ) : (
        <PosterGrid>
          {films.map((film) => (
            <PosterCard
              key={film.tmdb_id}
              title={film.title}
              year={film.release_year}
              posterUrl={posterUrl(film.poster_path)}
              href={`/movie/${film.tmdb_id}`}
              friends={friends.get(film.tmdb_id)}
              action={<RemoveButton tmdbId={film.tmdb_id} title={film.title} />}
            />
          ))}
        </PosterGrid>
      )}
    </>
  );
}
