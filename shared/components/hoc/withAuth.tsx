'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    redirectTo = '/login',
    validateRole,
    allowedRoles, // New: Array of allowed roles
  }: {
    redirectTo?: string;
    validateRole?: (
      user: { uid: string; email?: string | null },
      organizationId: string
    ) => Promise<string[]>;
    allowedRoles?: string[]; // Array of roles that can access the page
  } = {}
) => {
  return (props: P) => {
    const { user, loading } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const validateAccess = async () => {
        if (loading) return;

        if (!user) {
          router.replace(redirectTo); // Redirect if not authenticated
          return;
        }

        const organizationId = localStorage.getItem('selectedOrganizationId');
        if (!organizationId) {
          router.replace('/dashboard'); // Redirect to dashboard if no org selected
          return;
        }

        try {
          // Validate roles dynamically
          if (allowedRoles && validateRole) {
            const userRoles = await validateRole(user, organizationId);

            // Check if any role matches the allowed roles
            const accessGranted = userRoles.some((role) =>
              allowedRoles.includes(role)
            );

            setHasAccess(accessGranted);

            if (!accessGranted) {
              router.replace('/dashboard'); // Redirect if no matching role
            }
          } else {
            setHasAccess(true); // No role validation needed
          }
        } catch (error) {
          console.error('Error validating roles:', error);
          router.replace('/dashboard');
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
      return null; // Prevent rendering if no access
    }

    return <WrappedComponent {...props} />;
  };
};
