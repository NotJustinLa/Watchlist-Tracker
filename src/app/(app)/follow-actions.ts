/**
 * Follow actions: follow, unfollow, and answering requests.
 *
 * You always work with handles here; the database turns them into accounts on
 * the server, and no account id ever comes back to your browser.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import type { Database } from '@/lib/database.types';
import { handleSchema, invalidInput, type ActionError } from '@/lib/validation';

type FollowStatus = Database['public']['Enums']['follow_status'];

// Raised by follow_by_handle for an unknown handle or following yourself.
const USER_ERRORS = new Set(['P0002', '22023']);

/**
 * Follows a public member straight away, or sends a request to a private one.
 * Doing it twice changes nothing.
 */
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

/**
 * Stops following someone, or cancels a request you sent. Doing it twice
 * changes nothing.
 */
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

/**
 * Approves or declines a request someone sent you. It can only ever touch
 * requests sent to you.
 */
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
