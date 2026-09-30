import { Eye, Search, Star } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PosterCard } from '@/components/PosterCard';
import { PosterGrid } from '@/components/PosterGrid';
import { Segmented } from '@/components/Segmented';
import { createClient } from '@/lib/supabase/server';
import { posterUrl } from '@/lib/tmdb';
import { starFilterSchema, watchedSortSchema } from '@/lib/validation';

const sortLabels = { recent: 'Recent', rating: 'Rating', title: 'Title' };
type Sort = keyof typeof sortLabels;

function watchedHref(sort: Sort, stars?: number) {
  const params = new URLSearchParams();
  if (sort !== 'recent') params.set('sort', sort);
  if (stars) params.set('stars', String(stars));
  const query = params.toString();
  return query ? `/watched?${query}` : '/watched';
}

export default async function WatchedPage({
  searchParams,
}: PageProps<'/watched'>) {
  const params = await searchParams;
  const sort = watchedSortSchema.parse(params.sort);
  const stars = starFilterSchema.parse(params.stars);

  // RLS limits this to the signed-in user's rows. Newest first is the base order.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('watched')
    .select('rating, movies(tmdb_id, title, poster_path, release_year)')
    .order('watched_at', { ascending: false });
  if (error) throw error;

  const films = data.filter((row) => !stars || row.rating === stars);
  if (sort === 'rating') films.sort((a, b) => b.rating - a.rating);
  if (sort === 'title') {
    films.sort((a, b) => a.movies.title.localeCompare(b.movies.title));
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-title-lg">
          Watched{' '}
          <span className="font-semibold text-muted">{data.length}</span>
        </h1>
        {data.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Segmented
              label="Sort"
              options={Object.entries(sortLabels).map(([value, label]) => ({
                label,
                href: watchedHref(value as Sort, stars),
                active: sort === value,
              }))}
            />
            <Segmented
              label="Filter by rating"
              options={[
                { label: 'All', href: watchedHref(sort), active: !stars },
                ...[5, 4, 3, 2, 1].map((n) => ({
                  label: String(n),
                  href: watchedHref(sort, n),
                  active: stars === n,
                  icon: Star,
                  ariaLabel: `${n} stars`,
                })),
              ]}
            />
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Nothing watched yet"
          body="Rate a film to mark it watched. Your ratings shape your taste profile."
          action={
            <ButtonLink href="/" icon={Search}>
              Find a film
            </ButtonLink>
          }
        />
      ) : films.length === 0 ? (
        <EmptyState
          icon={Star}
          title={`No ${stars}-star films`}
          body="Try another rating filter."
          action={<ButtonLink href={watchedHref(sort)}>Show all</ButtonLink>}
        />
      ) : (
        <PosterGrid>
          {films.map(({ rating, movies: film }) => (
            <PosterCard
              key={film.tmdb_id}
              title={film.title}
              year={film.release_year}
              posterUrl={posterUrl(film.poster_path)}
              href={`/movie/${film.tmdb_id}`}
              rating={rating}
            />
          ))}
        </PosterGrid>
      )}
    </>
  );
}
