/**
 * Everything that talks to TMDB, the movie database. Server only.
 *
 * This is the only file that knows TMDB's shapes and URLs. It turns TMDB's
 * answers into the app's own simple film types, so no other file has to care.
 * Answers are cached for an hour.
 */

import 'server-only';

const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p';

export type Movie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

/** A film as shown on a Reels card. */
export type ReelFilm = Movie & { genres: string[]; overview: string };

type MovieDetail = Movie & {
  backdropUrl: string | null;
  runtime: number | null;
  genres: string[];
  overview: string;
};

type MovieSnapshot = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  genres: string[];
};

type TmdbMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path: string | null;
};

type TmdbListMovie = TmdbMovie & {
  overview: string;
  genre_ids: number[];
  adult?: boolean;
};

type TmdbMovieDetail = TmdbMovie & {
  backdrop_path: string | null;
  runtime: number | null;
  genres: { name: string }[];
  overview: string;
};

class TmdbError extends Error {
  constructor(readonly status: number) {
    super(`TMDB request failed with status ${status}`);
  }
}

/**
 * Calls TMDB with the server's token and returns the JSON, or throws with the
 * status if TMDB says no.
 */
async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  url.search = new URLSearchParams({ language: 'en-US', ...params }).toString();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new TmdbError(res.status);
  return res.json() as Promise<T>;
}

/**
 * Builds a full image address for a TMDB image path at a given size.
 */
const imageUrl = (size: string, path: string | null) =>
  path ? `${IMAGE_URL}/${size}${path}` : null;

/**
 * Turns a stored poster path into a grid-sized poster address.
 */
export const posterUrl = (path: string | null) => imageUrl('w342', path);

/**
 * Converts a TMDB film into the app's small film shape (id, title, year,
 * poster).
 */
function toMovie(m: TmdbMovie, posterSize = 'w342'): Movie {
  return {
    id: m.id,
    title: m.title,
    year: Number(m.release_date?.slice(0, 4)) || null,
    posterUrl: imageUrl(posterSize, m.poster_path),
  };
}

/**
 * Films that are popular on TMDB right now.
 */
export async function getPopular(): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/movie/popular');
  return data.results.map((m) => toMovie(m));
}

/**
 * Films whose title matches what you typed, with adult titles left out.
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/search/movie', {
    query,
    include_adult: 'false',
  });
  return data.results.map((m) => toMovie(m));
}

/**
 * The full TMDB record for one film, or null if it doesn't exist.
 */
async function fetchMovieDetail(id: number): Promise<TmdbMovieDetail | null> {
  try {
    return await tmdbFetch<TmdbMovieDetail>(`/movie/${id}`);
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Everything the movie page needs about one film, or null if there's no such
 * film.
 */
export async function getMovie(id: number): Promise<MovieDetail | null> {
  const m = await fetchMovieDetail(id);
  if (!m) return null;
  return {
    ...toMovie(m, 'w500'),
    backdropUrl: imageUrl('w1280', m.backdrop_path),
    runtime: m.runtime || null,
    genres: m.genres.map((g) => g.name),
    overview: m.overview,
  };
}

/**
 * The small copy of a film the database keeps (title, poster, year, genres).
 * Always built here from TMDB, never from your browser.
 */
export async function getMovieSnapshot(
  id: number,
): Promise<MovieSnapshot | null> {
  const m = await fetchMovieDetail(id);
  if (!m) return null;
  return {
    tmdbId: m.id,
    title: m.title,
    posterPath: m.poster_path,
    releaseYear: toMovie(m).year,
    genres: m.genres.map((g) => g.name),
  };
}

/**
 * TMDB's list of genre names, so cards can say "Drama" instead of a number.
 */
async function genreNames(): Promise<Map<number, string>> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>(
    '/genre/movie/list',
  );
  return new Map(data.genres.map((g) => [g.id, g.name]));
}

/**
 * Converts a TMDB list into Reels cards, adding genre names and dropping adult
 * titles.
 */
async function toReelFilms(results: TmdbListMovie[]): Promise<ReelFilm[]> {
  const names = await genreNames();
  return results
    .filter((m) => !m.adult)
    .map((m) => ({
      ...toMovie(m, 'w500'),
      overview: m.overview,
      genres: m.genre_ids.flatMap((id) => names.get(id) ?? []),
    }));
}

/**
 * TMDB's "if you liked this" list for a film.
 */
export async function getRecommendations(id: number, page: number) {
  const data = await tmdbFetch<{ results: TmdbListMovie[] }>(
    `/movie/${id}/recommendations`,
    { page: String(page) },
  );
  return toReelFilms(data.results);
}

/**
 * Films trending on TMDB this week.
 */
export async function getTrending(page: number) {
  const data = await tmdbFetch<{ results: TmdbListMovie[] }>(
    '/trending/movie/week',
    { page: String(page) },
  );
  return toReelFilms(data.results);
}
