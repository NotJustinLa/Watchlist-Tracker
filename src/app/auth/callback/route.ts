/**
 * Sign-in callback (`/auth/callback`).
 *
 * After you approve the login at Google, GitHub or Discord, you're sent here
 * with a one-time code. This swaps that code for your session, then takes you
 * home.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Turns the one-time login code into a session, or sends you back to sign-in if
 * it can't.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = z.string().min(1).max(512).safeParse(searchParams.get('code'));

  if (code.success) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code.data);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }
  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
