import { z } from 'zod';
import { createClient } from './supabase/server';
import { tmdbIdSchema } from './validation';

export type Friend = {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number | null;
};

const BATCH = 60;

/**
 * People you follow (approved) who watched each of the given films. One query per
 * 60 films (the database function's cap), so a normal grid is a single query.
 */
export async function getFriendsWhoWatched(tmdbIds: number[]) {
  const friends = new Map<number, Friend[]>();
  const ids = z.array(tmdbIdSchema).parse(tmdbIds);
  if (ids.length === 0) return friends;

  const supabase = await createClient();
  const batches = Array.from(
    { length: Math.ceil(ids.length / BATCH) },
    (_, i) => ids.slice(i * BATCH, (i + 1) * BATCH),
  );
  const results = await Promise.all(
    batches.map((batch) =>
      supabase.rpc('friends_who_watched', { tmdb_ids: batch }),
    ),
  );
  for (const { data, error } of results) {
    if (error) throw error;
    for (const row of data) {
      const list = friends.get(row.tmdb_id) ?? [];
      list.push({
        handle: row.handle,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        rating: row.rating,
      });
      friends.set(row.tmdb_id, list);
    }
  }
  return friends;
}
