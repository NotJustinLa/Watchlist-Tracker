/**
 * The all-access database client. Server only.
 *
 * It skips row-level security, so it's used for exactly one job: saving film
 * snapshots that were built from TMDB on the server.
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
