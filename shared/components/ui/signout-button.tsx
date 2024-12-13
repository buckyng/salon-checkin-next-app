'use client';

import { Button } from '@shared/components/ui/button';
import { auth } from '@shared/services/firebase';
import { useRouter } from 'next/navigation';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Sign out from Firebase
      router.replace('/login'); // Redirect to login page after signing out
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error signing out:', error.message);
      } else {
        console.error('Unknown error occurred during sign-out.');
      }
    }
  };

  return (
    <Button variant="destructive" onClick={handleSignOut} className={className}>
      Sign Out
    </Button>
  );
}
