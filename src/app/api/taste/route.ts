import { NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/auth';
import { generateTasteProfile, MIN_RATINGS } from '@/lib/gemini';
import { searchMovies } from '@/lib/tmdb';

const COOLDOWN_MS = 60_000;

const fail = (status: number, error: string) =>
  NextResponse.json({ error }, { status });

export async function POST() {
  let auth;
  try {
    auth = await requireUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) return fail(401, 'Sign in first.');
    throw error;
  }
  const { user, supabase } = auth;

  // RLS limits both reads to the user's own rows.
  const [previous, watched] = await Promise.all([
    supabase.from('taste_profiles').select('generated_at').maybeSingle(),
    supabase
      .from('watched')
      .select('rating, movies(tmdb_id, title, release_year, genres)')
      .order('rating', { ascending: false }),
  ]);
  if (previous.error || watched.error)
    return fail(500, 'Could not load your ratings.');

  const lastRun = previous.data && Date.parse(previous.data.generated_at);
  if (lastRun && Date.now() - lastRun < COOLDOWN_MS) {
    return fail(429, 'You can regenerate again in a minute.');
  }
  if (watched.data.length < MIN_RATINGS) {
    return fail(400, `Rate at least ${MIN_RATINGS} films first.`);
  }

  let taste;
  try {
    taste = await generateTasteProfile(
      watched.data.map(({ rating, movies }) => ({
        title: movies.title,
        year: movies.release_year,
        genres: movies.genres,
        rating,
      })),
    );
  } catch {
    return fail(502, 'The AI didn’t return a usable profile. Try again.');
  }

  // Ground each pick in a real TMDB film; drop unknowns, duplicates and films already watched.
  const seen = new Set(watched.data.map(({ movies }) => movies.tmdb_id));
  const resolved = await Promise.all(
    taste.recommendations.map(async ({ title, year, reason }) => {
      const results = await searchMovies(title).catch(() => []);
      const match =
        results.find((m) => m.year === year) ??
        results.find((m) => m.year && Math.abs(m.year - year) === 1);
      return match && { ...match, reason };
    }),
  );
  const recommendations = resolved.flatMap((m) => {
    if (!m || seen.has(m.id)) return [];
    seen.add(m.id);
    return [
      {
        tmdbId: m.id,
        title: m.title,
        year: m.year,
        posterUrl: m.posterUrl,
        reason: m.reason,
      },
    ];
  });

  const { error } = await supabase.from('taste_profiles').upsert({
    user_id: user.id,
    summary: taste.summary,
    recommendations,
    rating_count: watched.data.length,
    generated_at: new Date().toISOString(),
  });
  if (error) return fail(500, 'Could not save your taste profile.');

  return NextResponse.json({ ok: true });
}
