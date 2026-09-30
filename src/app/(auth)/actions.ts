'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const providerSchema = z.enum(['google', 'github', 'discord']);

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

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect('/sign-in');
}
