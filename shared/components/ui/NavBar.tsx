'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@shared/types/organization';
import { usePathname } from 'next/navigation';

interface NavBarProps {
  userRole?: UserRole | null;
  homepagePath: string; // Dynamic homepage path
}

const NavBar = ({ userRole, homepagePath }: NavBarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamically determine if the user is on the homepage
  const isHomePage = pathname === homepagePath;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleHomeNavigation = () => {
    router.push(homepagePath); // Replace '/' with your Home Page route if different
  };

  return (
    <nav className="fixed bottom-0 flex justify-around w-full py-3 text-white bg-gray-800">
      {!isHomePage && (
        <button className="text-white" onClick={handleHomeNavigation}>
          Home
        </button>
      )}
      <button
        className="text-white"
        onClick={() => handleNavigation('/settings')}
      >
        Settings
      </button>

      {/* Display organization-specific roles if the userRole exists */}
      {userRole && (
        <>
          {userRole.roles.includes('employee') && (
            <button
              className="text-white"
              onClick={() =>
                handleNavigation(
                  `/organizations/${userRole.organizationId}/employee`
                )
              }
            >
              Employee
            </button>
          )}
          {userRole.roles.includes('manager') && (
            <button
              className="text-white"
              onClick={() =>
                handleNavigation(
                  `/organizations/${userRole.organizationId}/manager`
                )
              }
            >
              Manager
            </button>
          )}
          {userRole.roles.includes('cashier') && (
            <button
              className="text-white"
              onClick={() =>
                handleNavigation(
                  `/organizations/${userRole.organizationId}/cashier`
                )
              }
            >
              Cashier
            </button>
          )}
        </>
      )}
    </nav>
  );
};

export default NavBar;
