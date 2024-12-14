'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    redirectTo = '/login',
    validateRole,
  }: {
    redirectTo?: string;
    validateRole?: (user: { uid: string; email?: string | null }) => Promise<boolean>;
  } = {}
) => {
  return (props: P) => {
    const { user, loading } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const validateAccess = async () => {
        if (loading) return; // Wait for authentication to finish

        if (!user) {
          router.replace(redirectTo); // Redirect if not authenticated
          return;
        }

        try {
          // Validate the user's role dynamically
          const accessGranted = validateRole ? await validateRole(user) : true;
          if (accessGranted) {
            setHasAccess(true); // Grant access
          } else {
            router.replace(redirectTo); // Redirect if role validation fails
          }
        } catch (error) {
          console.error('Error validating access:', error);
          router.replace(redirectTo); // Redirect on error
        } finally {
          setCheckingAccess(false);
        }
      };

      validateAccess();
    }, [user, loading, router]);

    if (loading || checkingAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
    }

    if (!hasAccess) {
      return null; // Prevent rendering if user doesn't have access
    }

    return <WrappedComponent {...props} />;
  };
};
