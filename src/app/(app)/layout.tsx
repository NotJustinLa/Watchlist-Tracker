import { AppNav } from '@/components/AppNav';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  // RLS returns only the signed-in user's profile.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle')
    .maybeSingle();

  return (
    <>
      <AppNav profileHref={profile ? `/u/${profile.handle}` : '/settings'} />
      <main className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12">
        {children}
      </main>
    </>
  );
}
