import { NextResponse } from 'next/server';
import { createClient } from './supabase/server';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  return { user, supabase };
}

/** For route handlers: the session, or a 401 response to return as-is. */
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
