/**
 * Sign-in and sign-out actions.
 *
 * These run on the server when you press a provider button or Sign out.
 */

'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const providerSchema = z.enum(['google', 'github', 'discord']);

/**
 * Starts signing you in with the provider you picked.
 *
 * It checks the provider is one we support, asks Supabase for that provider's
 * login page, and sends you there. If anything goes wrong you land back on the
 * sign-in page with an error message.
 */
export async function signIn(formData: FormData) {
  const provider = providerSchema.safeParse(formData.get('provider'));
  if (!provider.success) redirect('/sign-in?error=auth');

  const origin = (await headers()).get('origin');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider.data,
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) redirect('/sign-in?error=auth');
  redirect(data.url);
}

/**
 * Signs you out and takes you back to the sign-in page.
 */
export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect('/sign-in');
}
