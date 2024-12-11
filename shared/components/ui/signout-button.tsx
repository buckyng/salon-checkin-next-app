'use client';

import { Button } from '@shared/components/ui/button'; // Adjust path to your shared button component
import { signOut } from 'firebase/auth';
import { auth } from '@shared/services/firebase';
import { useRouter } from 'next/navigation';

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <Button variant="destructive" onClick={handleSignOut}>
      Logout
    </Button>
  );
};
