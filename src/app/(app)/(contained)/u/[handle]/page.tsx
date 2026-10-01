import { notFound } from 'next/navigation';
import { Inbox, Settings } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { getPendingRequestCount } from '@/lib/follows';
import { createClient } from '@/lib/supabase/server';
import { handleSchema } from '@/lib/validation';

export default async function ProfilePage({
  params,
}: PageProps<'/u/[handle]'>) {
  const handle = handleSchema.safeParse((await params).handle);
  if (!handle.success) notFound();

  // RLS returns only the signed-in user's own profile, so any other handle
  // (including your old one after a rename) is a 404 until member profiles exist.
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name')
    .eq('handle', handle.data)
    .maybeSingle();
  if (error) throw error;
  if (!profile) notFound();
  const requests = await getPendingRequestCount(profile.id);

  return (
    <section className="flex flex-col items-start gap-4">
      <div>
        <h1 className="text-title-lg">{profile.display_name}</h1>
        <p className="text-body-sm text-muted">@{profile.handle}</p>
      </div>
      <p className="text-body-sm text-muted">
        Your ratings and stats will appear here.
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/requests" icon={Inbox}>
          Requests
          {requests > 0 && (
            <span className="text-muted">{requests > 9 ? '9+' : requests}</span>
          )}
        </ButtonLink>
        <ButtonLink href="/settings" icon={Settings}>
          Settings
        </ButtonLink>
      </div>
    </section>
  );
}
