import 'server-only';

const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p';

export type Movie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

export type MovieDetail = Movie & {
  backdropUrl: string | null;
  runtime: number | null;
  genres: string[];
  overview: string;
};

export type MovieSnapshot = {
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

type TmdbMovieDetail = TmdbMovie & {
  backdrop_path: string | null;
  runtime: number | null;
  genres: { name: string }[];
  overview: string;
};

export class TmdbError extends Error {
  constructor(readonly status: number) {
    super(`TMDB request failed with status ${status}`);
  }
}

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

const imageUrl = (size: string, path: string | null) =>
  path ? `${IMAGE_URL}/${size}${path}` : null;

/** Grid-size poster URL for a stored `movies.poster_path`. */
export const posterUrl = (path: string | null) => imageUrl('w342', path);

function toMovie(m: TmdbMovie, posterSize = 'w342'): Movie {
  return {
    id: m.id,
    title: m.title,
    year: Number(m.release_date?.slice(0, 4)) || null,
    posterUrl: imageUrl(posterSize, m.poster_path),
  };
}

export async function getPopular(): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/movie/popular');
  return data.results.map((m) => toMovie(m));
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/search/movie', {
    query,
    include_adult: 'false',
  });
  return data.results.map((m) => toMovie(m));
}

async function fetchMovieDetail(id: number): Promise<TmdbMovieDetail | null> {
  try {
    return await tmdbFetch<TmdbMovieDetail>(`/movie/${id}`);
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error;
  }
}

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

// What the `movies` table stores: built from TMDB on the server, never from client data.
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
