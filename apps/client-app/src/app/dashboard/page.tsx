'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import { withAuth } from '@shared/components/hoc/withAuth';

interface Organization {
  id: string;
  name: string;
}

const DashboardPage = () => {
  const { user } = useAuth(); // Get authenticated user from context
  const router = useRouter();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch roles when the organization changes
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

  // Load organizations and select the first one if needed
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
          setSelectedOrganization(defaultOrganization);
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
  }, [user?.uid, fetchRolesForOrganization]);

  const handleOrganizationSelect = (org: Organization) => {
    setSelectedOrganization(org);
    localStorage.setItem('selectedOrganizationId', org.id);
    fetchRolesForOrganization(org.id);
  };

  const handleRoleSelect = (role: string) => {
    setActiveRole(role);
    localStorage.setItem('selectedRole', role);
  };

  const handleNavigate = () => {
    if (!selectedOrganization || !activeRole) return;

    switch (activeRole) {
      case 'owner':
        router.push(`/organizations/${selectedOrganization.id}/users`);
        break;
      case 'employee':
        router.push(`/organizations/${selectedOrganization.id}/employee`);
        break;
      case 'manager':
        router.push(`/organizations/${selectedOrganization.id}/manager`);
        break;
      case 'cashier':
        router.push(`/organizations/${selectedOrganization.id}/cashier`);
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
      {selectedOrganization && (
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Organization</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-white bg-blue-500 rounded">
                {selectedOrganization.name}
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
      {roles.length === 0 && selectedOrganization && (
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

export default withAuth(DashboardPage, { excludeOrgCheck: true });
