'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@shared/services/firebase';
import { SignOutButton } from '@shared/components/ui/signout-button';
import { Button } from '@shared/components/ui/button';
import { User } from 'firebase/auth';

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login'); // Redirect to login if user is not authenticated
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
    <div className="container px-4 mx-auto mt-10 ">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <SignOutButton />
      </div>

      {/* Welcome Text */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-700">
          Welcome, {user.email}
        </h2>
      </div>

      {/* Buttons Section */}
      <div className="flex flex-col gap-4">
        <Button
          variant="default"
          size="lg"
          className="w-full md:w-1/2"
          onClick={() => router.push('/organization')}
        >
          Manage Organization
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full md:w-1/2"
          onClick={() => router.push('/users')}
        >
          Manage Users
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
