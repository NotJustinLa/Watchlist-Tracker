import { SignOutButton } from '@/components/SignOutButton';

export default function ProfilePage() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-title-lg">Profile</h1>
      <p className="text-body-sm text-muted">
        Your profile, ratings and stats will appear here.
      </p>
      <SignOutButton />
    </section>
  );
}
