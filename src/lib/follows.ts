/**
 * Follow request helpers.
 */

import { createClient } from './supabase/server';

/**
 * How many people are waiting for you to approve their follow request.
 */
export async function getPendingRequestCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followee_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  return count ?? 0;
}
