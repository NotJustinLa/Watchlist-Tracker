import { AppNav } from '@/components/AppNav';
import { getPendingRequestCount } from '@/lib/follows';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  // RLS returns only the signed-in user's profile. Its id stays on the server.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle')
    .maybeSingle();
  const requests = profile ? await getPendingRequestCount(profile.id) : 0;

  return (
    <>
      <AppNav
        profileHref={profile ? `/u/${profile.handle}` : '/settings'}
        requests={requests}
      />
      <main className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12">
        {children}
      </main>
    </>
  );
}
