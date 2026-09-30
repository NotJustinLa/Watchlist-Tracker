import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';
import { Poster } from '@/components/PosterCard';
import type { Rating } from '@/components/StarRating';
import { createClient } from '@/lib/supabase/server';
import { getMovie } from '@/lib/tmdb';
import { tmdbIdParamSchema } from '@/lib/validation';
import { MovieActions } from './MovieActions';

export default async function MoviePage({ params }: PageProps<'/movie/[id]'>) {
  const id = tmdbIdParamSchema.safeParse((await params).id);
  if (!id.success) notFound();

  // RLS limits both queries to the signed-in user's own rows.
  const supabase = await createClient();
  const [movie, watched, watchlisted] = await Promise.all([
    getMovie(id.data),
    supabase
      .from('watched')
      .select('rating')
      .eq('tmdb_id', id.data)
      .maybeSingle(),
    supabase
      .from('watchlist_items')
      .select('tmdb_id')
      .eq('tmdb_id', id.data)
      .maybeSingle(),
  ]);
  if (!movie) notFound();
  if (watched.error) throw watched.error;
  if (watchlisted.error) throw watchlisted.error;

  const meta = [movie.year, movie.runtime && `${movie.runtime} min`]
    .filter(Boolean)
    .join(' · ');

  return (
    <article>
      <div className="relative h-55 overflow-hidden md:h-90">
        {movie.backdropUrl && (
          <Image
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-scrim-soft via-transparent via-35% to-bg" />
        <div className="absolute inset-x-0 top-0 h-6 bg-bg md:h-10" />
        <div className="absolute inset-x-0 bottom-0 h-6 bg-bg md:h-10" />
        <div className="absolute top-9 left-3 md:top-13">
          <BackButton />
        </div>
      </div>

      <div className="relative mx-auto -mt-24 flex max-w-content items-end gap-4 px-4 md:-mt-45 md:gap-8 md:px-8">
        <Poster
          url={movie.posterUrl}
          sizes="(min-width: 768px) 220px, 116px"
          priority
          className="w-29 flex-none shadow-poster md:w-55"
        />
        <div className="flex min-w-0 flex-col gap-1.5 pb-1">
          <h1 className="text-[26px] leading-7.5 font-extrabold tracking-[-0.02em] md:text-[44px] md:leading-12">
            {movie.title}
          </h1>
          {meta && <p className="text-body-sm text-muted">{meta}</p>}
          {movie.genres.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {movie.genres.map((genre) => (
                <li
                  key={genre}
                  className="flex h-6.5 items-center rounded-full border border-line bg-surface px-2.5 text-caption font-bold"
                >
                  {genre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 pt-6 md:grid md:grid-cols-[1.4fr_1fr] md:items-start md:gap-8 md:px-8 md:pt-8">
        <div className="md:order-2">
          <MovieActions
            tmdbId={movie.id}
            rating={(watched.data?.rating ?? 0) as Rating}
            onWatchlist={watchlisted.data !== null}
          />
        </div>
        <section className="flex max-w-prose flex-col gap-3">
          <h2 className="text-overline text-muted uppercase">Overview</h2>
          <p>{movie.overview || 'No overview available.'}</p>
        </section>
      </div>
    </article>
  );
}
