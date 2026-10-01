import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Users } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { EmptyState } from '@/components/EmptyState';
import { Poster } from '@/components/PosterCard';
import { StarRating, type Rating } from '@/components/StarRating';
import { UserChip } from '@/components/UserChip';
import { getFriendsWhoWatched } from '@/lib/friends';
import { getMyFilmStates } from '@/lib/my-films';
import { getMovie } from '@/lib/tmdb';
import { tmdbIdParamSchema } from '@/lib/validation';
import { MovieActions } from './MovieActions';

export default async function MoviePage({ params }: PageProps<'/movie/[id]'>) {
  const id = tmdbIdParamSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const [movie, mine, friendsByFilm] = await Promise.all([
    getMovie(id.data),
    getMyFilmStates([id.data]),
    getFriendsWhoWatched([id.data]),
  ]);
  const friends = friendsByFilm.get(id.data) ?? [];
  if (!movie) notFound();

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
            watched={mine.watched.has(movie.id)}
            rating={(mine.watched.get(movie.id) ?? 0) as Rating}
            onWatchlist={mine.watchlist.has(movie.id)}
          />
        </div>
        <div className="flex max-w-prose flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-overline text-muted uppercase">Overview</h2>
            <p>{movie.overview || 'No overview available.'}</p>
          </section>
          <section className="flex flex-col gap-1">
            <h2 className="text-overline text-muted uppercase">
              Friends who watched this · {friends.length}
            </h2>
            {friends.length === 0 ? (
              <EmptyState
                icon={Users}
                title="None of your friends yet"
                body="Be the first of your circle to log it."
              />
            ) : (
              <ul>
                {friends.map((friend) => (
                  <li
                    key={friend.handle}
                    className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <UserChip person={friend} />
                    </div>
                    {friend.rating ? (
                      <StarRating value={friend.rating as Rating} />
                    ) : (
                      <span className="text-body-sm text-muted">Not rated</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
