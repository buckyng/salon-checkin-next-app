'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@shared/contexts/UserContext';
import { fetchOrganizationsByUser } from '@shared/services/organizationService';
import { useRouter } from 'next/navigation';
import { Button } from '@shared/components/ui/button';
import { toast } from 'react-toastify';

const OrganizationsPage = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadOrganizations = async () => {
      if (!user) return;

      try {
        const orgs = await fetchOrganizationsByUser(user.uid);
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
        toast.error('Failed to load organizations.');
      }
    };

    loadOrganizations();
  }, [user]);

  const handleSelectOrganization = (orgId: string) => {
    router.push(`/organizations/${orgId}`);
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-4 text-2xl font-bold">Your Organizations</h1>
      <div className="grid gap-4">
        {organizations.map((org) => (
          <div key={org.id} className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold">{org.name}</h2>
            <p className="text-sm text-gray-500">
              Roles: {org.roles.join(', ')}
            </p>
            <Button
              variant="default"
              onClick={() => handleSelectOrganization(org.id)}
            >
              Manage
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsPage;
