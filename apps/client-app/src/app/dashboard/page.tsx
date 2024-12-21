'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';
import {
  fetchOrganizationsByUser,
  fetchUserRolesByOrganization,
} from '@shared/services/organizationService';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/components/ui/dropdown-menu';
import { useOrganization } from '@/app/hooks/useOrganization';

interface Organization {
  id: string;
  name: string;
}

const DashboardPage = () => {
  const { user } = useAuth(); // Get authenticated user
  const { organizationId, setOrganizationId, setSelectedRole } =
    useOrganization();
  const router = useRouter();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch roles dynamically when the organization changes
  const fetchRolesForOrganization = useCallback(
    async (orgId: string) => {
      if (!user?.uid) return;

      try {
        const userRoles = await fetchUserRolesByOrganization(user.uid, orgId);
        const flattenedRoles = userRoles.map((role) => role.roles).flat();
        setRoles(flattenedRoles);
        setActiveRole(flattenedRoles[0] || null); // Default to first role
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    },
    [user?.uid]
  );

  // Load organizations and initialize organization/role
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!user?.uid) return;

      try {
        const userOrganizations = await fetchOrganizationsByUser(user.uid);
        setOrganizations(userOrganizations);

        const storedOrgId = localStorage.getItem('selectedOrganizationId');
        const defaultOrganization =
          userOrganizations.find((org) => org.id === storedOrgId) ||
          userOrganizations[0];

        if (defaultOrganization) {
          setOrganizationId(defaultOrganization.id); // Save to context
          fetchRolesForOrganization(defaultOrganization.id);
          localStorage.setItem(
            'selectedOrganizationId',
            defaultOrganization.id
          );
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrganizations();
  }, [user?.uid, fetchRolesForOrganization, setOrganizationId]);

  // Handle organization selection
  const handleOrganizationSelect = (org: Organization) => {
    setOrganizationId(org.id);
    setRoles([]); // Clear roles on org change
    localStorage.setItem('selectedOrganizationId', org.id);
    fetchRolesForOrganization(org.id);
  };

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    setActiveRole(role);
    setSelectedRole(role); // Save selected role to context
    localStorage.setItem('selectedRole', role);
  };

  // Navigate to the selected role page
  const handleNavigate = () => {
    if (!organizationId || !activeRole) {
      console.error('Organization or role not selected.');
      return;
    }

    const baseUrl = `/organizations/${organizationId}`;
    switch (activeRole) {
      case 'owner':
        router.push(`${baseUrl}/owner`);
        break;
      case 'employee':
        router.push(`${baseUrl}/employee`);
        break;
      case 'manager':
        router.push(`${baseUrl}/manager`);
        break;
      case 'cashier':
        router.push(`${baseUrl}/cashier`);
        break;
      default:
        console.error('Invalid role selected');
    }
  };

  if (loading) {
    return <div className="mt-10 text-center">Loading...</div>;
  }

  return (
    <div className="container p-6 mx-auto mt-10">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      {/* Organization Selection */}
      {organizations.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Select Organization</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-white bg-blue-500 rounded">
                {organizations.find((org) => org.id === organizationId)?.name ||
                  'Select Organization'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org)}
                >
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Warning Text if No Roles */}
      {roles.length === 0 && organizationId && (
        <div className="mb-4 text-center text-red-500">
          You do not have any roles in this organization. Please contact your
          administrator.
        </div>
      )}

      {/* Role Selection */}
      {roles.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Select Role</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-white bg-blue-500 rounded">
                {activeRole || 'Select Role'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {roles.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Proceed Button */}
      {activeRole && (
        <div className="mt-6">
          <button
            onClick={handleNavigate}
            className="px-4 py-2 text-white bg-green-500 rounded"
          >
            Go to {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}{' '}
            Page
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
