'use client';

import { Button } from '@shared/components/ui/button';
import { logout } from '@shared/services/authService';
import { useRouter } from 'next/navigation';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Error during signout:', error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleSignOut} className={className}>
      Sign Out
    </Button>
  );
}
