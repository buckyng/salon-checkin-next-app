'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@shared/services/authService';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
      alert('Sign-up successful! You can now log in.');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      alert('Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Sign Up</h1>
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mb-2"
        />
        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="mb-2"
        />
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
        <Button onClick={handleSignUp} className="w-full" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
        <p className="mt-2 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
