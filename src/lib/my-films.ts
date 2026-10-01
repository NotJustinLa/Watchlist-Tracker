/**
 * Your own status for films on screen.
 */

import { createClient } from './supabase/server';

/**
 * For a set of films, which you've watched (and your rating) and which are on
 * your watchlist, in one query per table.
 */
export async function getMyFilmStates(tmdbIds: number[]) {
  if (tmdbIds.length === 0) {
    return {
      watched: new Map<number, number | null>(),
      watchlist: new Set<number>(),
    };
  }
  const supabase = await createClient();
  const [watched, watchlist] = await Promise.all([
    supabase.from('watched').select('tmdb_id, rating').in('tmdb_id', tmdbIds),
    supabase.from('watchlist_items').select('tmdb_id').in('tmdb_id', tmdbIds),
  ]);
  if (watched.error) throw watched.error;
  if (watchlist.error) throw watchlist.error;

  return {
    watched: new Map(watched.data.map((row) => [row.tmdb_id, row.rating])),
    watchlist: new Set(watchlist.data.map((row) => row.tmdb_id)),
  };
}
