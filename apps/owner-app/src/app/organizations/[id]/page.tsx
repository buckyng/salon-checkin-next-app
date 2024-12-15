'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrganization } from '@shared/services/organizationService';
import { Organization } from '@shared/types/organization';

const OrganizationDashboard = ({
  params: promiseParams,
}: {
  params: Promise<{ id: string }>;
}) => {
  const params = use(promiseParams); // Unwrap params using `use()`
  const organizationId = params.id;
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [organizationId]);

  if (loading) {
    return <p className="text-center">Loading organization details...</p>;
  }

  if (!organization) {
    return <p className="text-center text-red-500">Organization not found.</p>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold">{organization.name}</h1>
      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/organizations/${organizationId}/users`)}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Manage Users
        </button>
        <button
          onClick={() => router.push(`/organizations/${organizationId}/report`)}
          className="px-4 py-2 text-white bg-green-500 rounded"
        >
          Report
        </button>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
