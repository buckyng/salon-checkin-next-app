'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrganizationsByUser } from '@shared/services/organizationService';
import { useAuth } from '@shared/contexts/UserContext';
import { Button } from '@shared/components/ui/button';
import { toast } from 'react-toastify';

interface Organization {
  id: string;
  name: string;
}

const OrganizationsPage = () => {
  const { user } = useAuth(); // Retrieve logged-in user
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadOrganizations = async () => {
      try {
        const orgs = await fetchOrganizationsByUser(user.uid); // Fetch organizations for the user
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to load organizations.');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [user]);

  const handleSelectOrganization = (orgId: string) => {
    router.push(`/organizations/${orgId}`);
  };

  if (loading) {
    return <p className="text-center">Loading organizations...</p>;
  }

  if (organizations.length === 0) {
    return (
      <p className="text-center">You are not part of any organizations.</p>
    );
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold">Your Organizations</h1>
      <div className="grid gap-4">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
          >
            <h2 className="text-lg font-bold">{org.name}</h2>
            <Button
              variant="default"
              onClick={() => handleSelectOrganization(org.id)}
            >
              Select
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsPage;
