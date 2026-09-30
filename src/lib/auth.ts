import { createClient } from './supabase/server';

export class UnauthorizedError extends Error {
  readonly status = 401;

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
