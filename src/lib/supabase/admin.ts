import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

// Bypasses RLS. Only used to write `movies` snapshots built from server-side TMDB data.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
