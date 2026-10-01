/**
 * Where the films in Reels come from. Server only.
 */

import 'server-only';
import { createClient } from './supabase/server';
import {
  getMovie,
  getRecommendations,
  getTrending,
  type ReelFilm,
} from './tmdb';
import { storedRecommendationsSchema } from './validation';

export type ReelItem = ReelFilm & { reason: string };

/** The feed stops after this many batches. */
export const REEL_PAGES = 30;

/**
 * One batch of films for the Reels deck.
 *
 * The first batch starts with your AI picks. Every batch then adds TMDB
 * recommendations for one of the films you rated 4 or 5 stars (taking turns
 * between them), or trending films if you haven't rated anything that highly.
 * Films you've watched or saved, and films without a poster, are left out.
 */
export async function getReelBatch(page: number): Promise<ReelItem[]> {
  // RLS limits all three reads to the signed-in user's rows.
  const supabase = await createClient();
  const [watched, watchlist, taste] = await Promise.all([
    supabase
      .from('watched')
      .select('rating, movies(tmdb_id, title)')
      .order('watched_at', { ascending: false }),
    supabase.from('watchlist_items').select('tmdb_id'),
    page === 0
      ? supabase.from('taste_profiles').select('recommendations').maybeSingle()
      : null,
  ]);
  if (watched.error) throw watched.error;
  if (watchlist.error) throw watchlist.error;
  if (taste?.error) throw taste.error;

  const exclude = new Set([
    ...watched.data.map((row) => row.movies.tmdb_id),
    ...watchlist.data.map((row) => row.tmdb_id),
  ]);
  const seeds = watched.data
    .filter((row) => (row.rating ?? 0) >= 4)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 10)
    .map((row) => row.movies);

  const items: ReelItem[] = [];

  if (taste?.data) {
    const picks = storedRecommendationsSchema.parse(taste.data.recommendations);
    const films = await Promise.all(picks.map((pick) => getMovie(pick.tmdbId)));
    films.forEach((film, i) => {
      if (film) {
        const { id, title, year, posterUrl, genres, overview } = film;
        items.push({
          id,
          title,
          year,
          posterUrl,
          genres,
          overview,
          reason: picks[i]!.reason,
        });
      }
    });
  }

  const seed = seeds[page % Math.max(seeds.length, 1)];
  if (seed) {
    const tmdbPage = Math.floor(page / seeds.length) + 1;
    const films = await getRecommendations(seed.tmdb_id, tmdbPage);
    films.forEach((film) =>
      items.push({ ...film, reason: `Because you loved ${seed.title}` }),
    );
  } else {
    const films = await getTrending(page + 1);
    films.forEach((film) =>
      items.push({ ...film, reason: 'Trending this week' }),
    );
  }

  const kept = new Set<number>();
  return items.filter((item) => {
    if (!item.posterUrl || exclude.has(item.id) || kept.has(item.id))
      return false;
    kept.add(item.id);
    return true;
  });
}
