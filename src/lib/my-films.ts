import { createClient } from './supabase/server';

/**
 * The signed-in user's rating and watchlist status for the given films,
 * in one query per table. RLS limits both to the user's own rows.
 */
export async function getMyFilmStates(tmdbIds: number[]) {
  const supabase = await createClient();
  const [watched, watchlist] = await Promise.all([
    supabase.from('watched').select('tmdb_id, rating').in('tmdb_id', tmdbIds),
    supabase.from('watchlist_items').select('tmdb_id').in('tmdb_id', tmdbIds),
  ]);
  if (watched.error) throw watched.error;
  if (watchlist.error) throw watchlist.error;

  return {
    ratings: new Map(watched.data.map((row) => [row.tmdb_id, row.rating])),
    watchlist: new Set(watchlist.data.map((row) => row.tmdb_id)),
  };
}
