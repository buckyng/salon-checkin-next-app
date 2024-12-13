'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@shared/services/firebase';

interface WithAuthProps {
  children: ReactNode;
  redirectTo?: string; // Route to redirect unauthenticated users
}

export function withAuth({ children, redirectTo = '/login' }: WithAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push(redirectTo);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Prevent rendering if user is not authenticated
  }

  return <>{children}</>;
}
