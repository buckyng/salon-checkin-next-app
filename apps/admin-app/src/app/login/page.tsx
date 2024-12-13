'use client';

import { useUser } from '@shared/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useUser();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login();
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
