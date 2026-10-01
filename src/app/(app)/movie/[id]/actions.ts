/**
 * Watchlist, watched and rating actions.
 *
 * These run on the server whenever you save, watch or rate a film, from any
 * page. Each one checks you're signed in, checks the input, and only ever
 * touches your own rows. Problems you can fix (bad input, an unknown film,
 * rating something you haven't marked watched) come back as a message; real
 * server failures throw.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getMovieSnapshot } from '@/lib/tmdb';
import {
  invalidInput,
  ratingSchema,
  tmdbIdSchema,
  type ActionError,
} from '@/lib/validation';

/**
 * Stores a small copy of the film (title, poster, year, genres) so lists and
 * feeds don't need to call TMDB.
 *
 * The details always come from TMDB on the server, never from your browser, so
 * nobody can plant a fake title. Returns false if TMDB has no such film.
 */
async function saveMovieSnapshot(tmdbId: number) {
  const movie = await getMovieSnapshot(tmdbId);
  if (!movie) return false;
  const { error } = await supabaseAdmin.from('movies').upsert({
    tmdb_id: movie.tmdbId,
    title: movie.title,
    poster_path: movie.posterPath,
    release_year: movie.releaseYear,
    genres: movie.genres,
  });
  if (error) throw error;
  return true;
}

const filmNotFound: ActionError = { error: 'Film not found.' };

type Session = Awaited<ReturnType<typeof requireUser>>;

/**
 * Removes one of your own rows (from Watched or your watchlist) for a film.
 */
async function deleteOwnRow(
  { user, supabase }: Session,
  table: 'watched' | 'watchlist_items',
  tmdbId: number,
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('user_id', user.id)
    .eq('tmdb_id', tmdbId);
  if (error) throw error;
}

/**
 * Puts a film on your watchlist, or takes it off.
 *
 * You say which you want rather than toggling, so a double tap can't flip it
 * back.
 */
export async function setOnWatchlist(
  tmdbId: number,
  onWatchlist: boolean,
): Promise<ActionError | void> {
  const session = await requireUser();
  const { user, supabase } = session;
  const id = tmdbIdSchema.safeParse(tmdbId);
  const on = z.boolean().safeParse(onWatchlist);
  if (!id.success || !on.success) return invalidInput;

  if (on.data) {
    if (!(await saveMovieSnapshot(id.data))) return filmNotFound;
    const { error } = await supabase
      .from('watchlist_items')
      .upsert(
        { user_id: user.id, tmdb_id: id.data },
        { ignoreDuplicates: true },
      );
    if (error) throw error;
  } else {
    await deleteOwnRow(session, 'watchlist_items', id.data);
  }
  revalidatePath('/', 'layout');
}

/**
 * Marks a film as watched, or unmarks it.
 *
 * Marking it watched takes it off your watchlist. Unmarking it also clears your
 * rating.
 */
export async function setWatched(
  tmdbId: number,
  watched: boolean,
): Promise<ActionError | void> {
  const session = await requireUser();
  const { user, supabase } = session;
  const id = tmdbIdSchema.safeParse(tmdbId);
  const on = z.boolean().safeParse(watched);
  if (!id.success || !on.success) return invalidInput;

  if (on.data) {
    if (!(await saveMovieSnapshot(id.data))) return filmNotFound;
    const { error } = await supabase
      .from('watched')
      .upsert(
        { user_id: user.id, tmdb_id: id.data },
        { ignoreDuplicates: true },
      );
    if (error) throw error;
    await deleteOwnRow(session, 'watchlist_items', id.data);
  } else {
    await deleteOwnRow(session, 'watched', id.data);
  }
  revalidatePath('/', 'layout');
}

/**
 * Gives a watched film 1 to 5 stars, or clears the rating if you pass null.
 *
 * Only works for films you've already marked watched, and keeps the date you
 * first watched it.
 */
export async function rateMovie(
  tmdbId: number,
  rating: number | null,
): Promise<ActionError | void> {
  const { user, supabase } = await requireUser();
  const id = tmdbIdSchema.safeParse(tmdbId);
  const stars = ratingSchema.nullable().safeParse(rating);
  if (!id.success || !stars.success) return invalidInput;

  const { data, error } = await supabase
    .from('watched')
    .update({ rating: stars.data })
    .eq('user_id', user.id)
    .eq('tmdb_id', id.data)
    .select('tmdb_id');
  if (error) throw error;
  if (data.length === 0) return { error: 'Mark the film as watched first.' };
  revalidatePath('/', 'layout');
}
