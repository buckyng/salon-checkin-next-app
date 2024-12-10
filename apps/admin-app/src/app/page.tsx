'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@shared/services/firebase';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check the authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/dashboard'); // Redirect to dashboard if logged in
      } else {
        router.push('/login'); // Redirect to login if not logged in
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-600">Redirecting...</p>
    </div>
  );
};

export default HomePage;
