'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@shared/contexts/UserContext';
import { fetchOrganizationsByUser } from '@shared/services/organizationService';
import { useRouter } from 'next/navigation';
import { Button } from '@shared/components/ui/button';

interface Organization {
  id: string;
  name: string;
}

const OrganizationsPage = () => {
  const { user, setSelectedOrganization } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const orgs = await fetchOrganizationsByUser(user.uid);
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user]);

  const handleSelectOrganization = (organization: Organization) => {
    setSelectedOrganization(organization); // Save in context
    localStorage.setItem('selectedOrganizationId', organization.id); // Save in local storage
    router.push(`/organizations/${organization.id}/`); // Navigate with organizationId in URL
  };

  if (loading) {
    return <div className="text-center">Loading organizations...</div>;
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center">You are not part of any organization.</div>
    );
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold">Select Organization</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="p-4 transition-shadow border rounded shadow hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">{org.name}</h2>
            <Button
              className="w-full mt-4"
              onClick={() => handleSelectOrganization(org)}
            >
              Go to {org.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsPage;
