'use client';

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
    <button
      onClick={handleSignOut}
      className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
    >
      Sign Out
    </button>
  );
};
