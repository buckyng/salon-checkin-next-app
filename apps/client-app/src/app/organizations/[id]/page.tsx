'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchOrganization,
  fetchUserRolesByOrganization,
} from '@shared/services/organizationService';
import { useAuth } from '@shared/contexts/UserContext';
import { Organization, UserRole } from '@shared/types/organization';
import { Button } from '@shared/components/ui/button';

const OrganizationDashboard = ({
  params: promiseParams,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { user } = useAuth();
  const params = use(promiseParams); // Unwrap params using `use()`
  const organizationId = params.id;
  const router = useRouter();

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadRoles = async () => {
      try {
        const role = await fetchUserRolesByOrganization(
          user.uid,
          organizationId
        );
        setUserRole(role);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadOrganization = async () => {
      try {
        const org = await fetchOrganization(organizationId); // Fetch organization details
        setOrganization(org);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadOrganization();
    loadRoles();
  }, [user, organizationId]);

  if (loading) {
    return (
      <p className="text-center">Loading roles or organization details...</p>
    );
  }

  if (!userRole || userRole.roles.length === 0) {
    return (
      <p className="text-center">
        You do not have any roles in this organization.
      </p>
    );
  }

  if (!organization) {
    return <p className="text-center text-red-500">Organization not found.</p>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold">
        Welcome to {organization.name}
      </h1>

      {/* Role-Based Navigation */}
      <div className="flex flex-col gap-4">
        {userRole.roles.includes('employee') && (
          <Button
            onClick={() =>
              router.push(`/organizations/${organizationId}/employee`)
            }
          >
            Employee Home
          </Button>
        )}
        {userRole.roles.includes('cashier') && (
          <Button
            onClick={() =>
              router.push(`/organizations/${organizationId}/cashier`)
            }
          >
            Cashier Home
          </Button>
        )}
        {userRole.roles.includes('manager') && (
          <Button
            onClick={() =>
              router.push(`/organizations/${organizationId}/manager`)
            }
          >
            Manager Home
          </Button>
        )}
        <Button
          onClick={() => router.push(`/organizations/${organizationId}/report`)}
        >
          Report
        </Button>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
