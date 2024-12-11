'use client';

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@shared/services/firebase';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError(null); // Clear previous errors
      await signInWithPopup(auth, provider); // Sign in using Google
      router.push('/dashboard'); // Redirect to the dashboard
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Display error message
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  useEffect(() => {
    // Check if the user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/dashboard'); // Redirect to dashboard if already logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white rounded-md shadow-md">
        <h1 className="mb-4 text-2xl font-semibold text-center">Admin Login</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
