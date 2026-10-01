/**
 * App layout: the frame around every signed-in page.
 *
 * It puts the navigation on screen (a bottom bar on your phone, a top bar on a
 * bigger screen) and works out two things the nav needs about you: where your
 * profile lives and how many follow requests are waiting for you.
 */

import { AppNav } from '@/components/AppNav';
import { getPendingRequestCount } from '@/lib/follows';
import { createClient } from '@/lib/supabase/server';

/**
 * Shows the nav (with your profile link and request badge) around the page
 * you're on.
 */
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
