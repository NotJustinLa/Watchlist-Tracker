/**
 * Who's signed in.
 *
 * Every server action and API route starts by calling one of these, so nothing
 * runs for someone who isn't signed in.
 */

import { NextResponse } from 'next/server';
import { createClient } from './supabase/server';

/**
 * Thrown when there's no signed-in user.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

/**
 * Returns the signed-in user and a database client acting as them, or throws if
 * nobody is signed in.
 *
 * It asks Supabase to verify the session rather than trusting the cookie on its
 * own.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  return { user, supabase };
}

/**
 * For API routes: the same check, but it hands back a ready-made 401 response
 * instead of throwing.
 */
export async function requireUserOr401() {
  try {
    return await requireUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    }
    throw error;
  }
}
