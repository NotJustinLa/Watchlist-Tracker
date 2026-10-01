'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { handleSchema } from '@/lib/validation';

// Each action takes a handle; the database functions resolve it to an id
// as the signed-in user, and no id is ever returned.

/** Follows a public member, or requests to follow a private one. Idempotent. */
export async function follow(handle: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc('follow_by_handle', {
    target_handle: handleSchema.parse(handle),
  });
  if (error) throw error;
  revalidatePath('/', 'layout');
  return data;
}

/** Unfollows, or cancels a pending request. Idempotent. */
export async function unfollow(handle: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc('unfollow_by_handle', {
    target_handle: handleSchema.parse(handle),
  });
  if (error) throw error;
  revalidatePath('/', 'layout');
}

/** Approves or declines a pending request made to the signed-in user. */
export async function respondToRequest(handle: string, approve: boolean) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc('respond_to_request', {
    follower_handle: handleSchema.parse(handle),
    approve: z.boolean().parse(approve),
  });
  if (error) throw error;
  revalidatePath('/', 'layout');
}
