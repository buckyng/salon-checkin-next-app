'use client';

import { Button } from '@shared/components/ui/button';
import { auth } from '@shared/services/firebase';
import { useRouter } from 'next/navigation';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleSignout = async () => {
    try {
      await auth.signOut();
      router.push('/login'); // Redirect to login page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleSignout} className={className}>
      Sign Out
    </Button>
  );
}
