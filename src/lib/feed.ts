/**
 * Your activity feed. Server only.
 */

import 'server-only';
import { createClient } from './supabase/server';
import { posterUrl } from './tmdb';

export const FEED_PAGE_SIZE = 20;

export type FeedEvent = {
  kind: 'watched' | 'watchlist';
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  tmdbId: number;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  at: string;
};

/**
 * One page of activity from the people you follow, older than the given time.
 */
export async function getFeed(before?: string): Promise<FeedEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_feed', {
    before,
    page_size: FEED_PAGE_SIZE,
  });
  if (error) throw error;
  return data.map((row) => ({
    kind: row.kind === 'watchlist' ? 'watchlist' : 'watched',
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    tmdbId: row.tmdb_id,
    title: row.title,
    posterUrl: posterUrl(row.poster_path),
    rating: row.rating,
    at: row.at,
  }));
}
