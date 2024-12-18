'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserRoles } from '@shared/services/organizationService';

interface NavBarProps {
  homepagePath: string; // Path to the homepage (e.g., organizations page)
  organizationId?: string; // Current organization ID
}

export const NavBar: React.FC<NavBarProps> = ({
  homepagePath,
  organizationId,
}) => {
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);

  // Fetch roles dynamically when organizationId changes
  useEffect(() => {
    const fetchRoles = async () => {
      if (organizationId) {
        try {
          const userId = localStorage.getItem('userId'); // Replace with your auth context or state
          if (userId) {
            const userRoles = await fetchUserRoles(userId, organizationId);
            setRoles(userRoles.map((role) => role.roles).flat());
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
        }
      } else {
        setRoles([]); // Clear roles if no organization is selected
      }
    };

    fetchRoles();
  }, [organizationId]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-between p-4 text-white bg-blue-500">
      {/* Home Button */}
      <button onClick={() => handleNavigation(homepagePath)}>Home</button>

      {/* Dynamic Role-Based Buttons */}
      {organizationId && (
        <>
          {roles.includes('employee') && (
            <button
              onClick={() =>
                handleNavigation(`/organizations/${organizationId}/employee`)
              }
            >
              Employee
            </button>
          )}
          {roles.includes('manager') && (
            <button
              onClick={() =>
                handleNavigation(`/organizations/${organizationId}/manager`)
              }
            >
              Manager
            </button>
          )}
          {roles.includes('cashier') && (
            <button
              onClick={() =>
                handleNavigation(`/organizations/${organizationId}/cashier`)
              }
            >
              Cashier
            </button>
          )}
        </>
      )}

      {/* Settings */}
      <button onClick={() => handleNavigation('/settings')}>Settings</button>
    </nav>
  );
};
