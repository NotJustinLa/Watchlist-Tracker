import { createClient } from '@/lib/supabase/server';
import { RequestList } from './RequestList';

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: requests, error } = await supabase.rpc('get_follow_requests');
  if (error) throw error;

  return (
    <>
      <h1 className="text-title-lg">
        Follow requests{' '}
        <span className="font-semibold text-muted">{requests.length}</span>
      </h1>
      <RequestList
        requests={requests.map((request) => ({
          handle: request.handle,
          displayName: request.display_name,
          avatarUrl: request.avatar_url,
        }))}
      />
    </>
  );
}
