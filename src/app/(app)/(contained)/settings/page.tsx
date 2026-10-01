import { SignOutButton } from '@/components/SignOutButton';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
  // RLS returns only the signed-in user's profile.
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('handle, display_name, is_private')
    .single();
  if (error) throw error;

  return (
    <>
      <h1 className="text-title-lg">Settings</h1>
      <SettingsForm
        profile={{
          handle: profile.handle,
          displayName: profile.display_name,
          isPrivate: profile.is_private,
        }}
      />
      <section className="flex max-w-lg flex-col items-start gap-3 border-t border-line pt-6">
        <h2 className="text-title">Account</h2>
        <SignOutButton />
      </section>
    </>
  );
}
