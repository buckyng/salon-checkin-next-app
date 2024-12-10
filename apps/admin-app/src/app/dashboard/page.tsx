'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@shared/services/firebase';
import { SignOutButton } from '@shared/components/ui/SignOutButton';

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null); // Replace `any` with your user type
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
};

export default DashboardPage;
