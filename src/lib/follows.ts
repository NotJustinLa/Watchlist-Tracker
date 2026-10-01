import { createClient } from './supabase/server';

/** Pending follow requests waiting on `userId` (the signed-in user's own id). */
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
