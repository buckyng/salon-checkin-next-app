'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@shared/services/authService';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Error signing in:', error);
      alert('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Log In</h1>
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleSignIn} className="w-full" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </Button>
        <p className="mt-2 text-sm">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-500 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
