import { LogOut } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import { Button } from './Button';

export function SignOutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant={iconOnly ? 'ghost' : 'default'}
        icon={LogOut}
        iconOnly={iconOnly}
        aria-label={iconOnly ? 'Sign out' : undefined}
      >
        {!iconOnly && 'Sign out'}
      </Button>
    </form>
  );
}
