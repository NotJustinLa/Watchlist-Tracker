'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import type { Database } from '@/lib/database.types';
import { handleSchema, invalidInput, type ActionError } from '@/lib/validation';

// Each action takes a handle; the database functions resolve it to an id
// as the signed-in user, and no id is ever returned.

type FollowStatus = Database['public']['Enums']['follow_status'];

// Raised by follow_by_handle for an unknown handle or following yourself.
const USER_ERRORS = new Set(['P0002', '22023']);

/** Follows a public member, or requests to follow a private one. Idempotent. */
export async function follow(
  handle: string,
): Promise<{ status: FollowStatus } | ActionError> {
  const { supabase } = await requireUser();
  const target = handleSchema.safeParse(handle);
  if (!target.success) return invalidInput;

  const { data, error } = await supabase.rpc('follow_by_handle', {
    target_handle: target.data,
  });
  if (error && USER_ERRORS.has(error.code)) return { error: error.message };
  if (error) throw error;
  revalidatePath('/', 'layout');
  return { status: data };
}

/** Unfollows, or cancels a pending request. Idempotent. */
export async function unfollow(handle: string): Promise<ActionError | void> {
  const { supabase } = await requireUser();
  const target = handleSchema.safeParse(handle);
  if (!target.success) return invalidInput;

  const { error } = await supabase.rpc('unfollow_by_handle', {
    target_handle: target.data,
  });
  if (error) throw error;
  revalidatePath('/', 'layout');
}

/** Approves or declines a pending request made to the signed-in user. */
export async function respondToRequest(
  handle: string,
  approve: boolean,
): Promise<ActionError | void> {
  const { supabase } = await requireUser();
  const follower = handleSchema.safeParse(handle);
  const answer = z.boolean().safeParse(approve);
  if (!follower.success || !answer.success) return invalidInput;

  const { error } = await supabase.rpc('respond_to_request', {
    follower_handle: follower.data,
    approve: answer.data,
  });
  if (error) throw error;
  revalidatePath('/', 'layout');
}
