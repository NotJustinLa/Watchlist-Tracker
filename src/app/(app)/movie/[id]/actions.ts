'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getMovieSnapshot } from '@/lib/tmdb';
import { ratingSchema, tmdbIdSchema } from '@/lib/validation';

// Upserts the display snapshot from TMDB so rows referencing this film have a `movies` row.
async function saveMovieSnapshot(tmdbId: number) {
  const movie = await getMovieSnapshot(tmdbId);
  if (!movie) throw new Error('Movie not found');
  const { error } = await supabaseAdmin.from('movies').upsert({
    tmdb_id: movie.tmdbId,
    title: movie.title,
    poster_path: movie.posterPath,
    release_year: movie.releaseYear,
    genres: movie.genres,
  });
  if (error) throw error;
}

export async function setOnWatchlist(tmdbId: number, onWatchlist: boolean) {
  const { user, supabase } = await requireUser();
  const id = tmdbIdSchema.parse(tmdbId);
  const on = z.boolean().parse(onWatchlist);

  if (on) {
    await saveMovieSnapshot(id);
    const { error } = await supabase
      .from('watchlist_items')
      .upsert({ user_id: user.id, tmdb_id: id }, { ignoreDuplicates: true });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('tmdb_id', id);
    if (error) throw error;
  }
  revalidatePath('/', 'layout');
}

// Rating marks the film watched and takes it off the watchlist.
// Re-rating keeps the original watched_at.
export async function rateMovie(tmdbId: number, rating: number) {
  const { user, supabase } = await requireUser();
  const id = tmdbIdSchema.parse(tmdbId);
  const stars = ratingSchema.parse(rating);

  await saveMovieSnapshot(id);
  const { error } = await supabase
    .from('watched')
    .upsert({ user_id: user.id, tmdb_id: id, rating: stars });
  if (error) throw error;

  const { error: watchlistError } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('tmdb_id', id);
  if (watchlistError) throw watchlistError;
  revalidatePath('/', 'layout');
}

export async function removeRating(tmdbId: number) {
  const { user, supabase } = await requireUser();
  const id = tmdbIdSchema.parse(tmdbId);

  const { error } = await supabase
    .from('watched')
    .delete()
    .eq('user_id', user.id)
    .eq('tmdb_id', id);
  if (error) throw error;
  revalidatePath('/', 'layout');
}
