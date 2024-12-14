'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';
import { fetchAdminEmails } from '@shared/services/adminService';

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo = '/login'
) => {
  return (props: P) => {
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const validateAdmin = async () => {
        if (loading) return; // Wait for authentication to finish

        if (!user) {
          router.replace(redirectTo); // Redirect if not authenticated
          return;
        }

        try {
          const adminEmails = await fetchAdminEmails();
          if (adminEmails.includes(user.email || '')) {
            setIsAdmin(true); // Grant access to admin pages
          } else {
            router.replace('/login'); // Redirect if not an admin
          }
        } catch (error) {
          console.error('Error validating admin access:', error);
          router.replace('/login'); // Redirect on error
        } finally {
          setCheckingAdmin(false);
        }
      };

      validateAdmin();
    }, [user, loading, router]);

    if (loading || checkingAdmin) {
      return <p>Loading...</p>; // Show loading state during validation
    }

    if (!isAdmin) {
      return null; // Prevent rendering if user is not an admin
    }

    return <WrappedComponent {...props} />;
  };
};
