'use client';

import { signInWithGoogle } from '@shared/services/authService';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to log in. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button
        onClick={handleLogin}
        className="p-4 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  );
}
