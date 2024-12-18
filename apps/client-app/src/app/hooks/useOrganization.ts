import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchOrganizationById } from '@shared/services/organizationService';

export const useOrganization = (paramOrgId?: string) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let orgId = paramOrgId;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      if (storedOrgId) {
        orgId = storedOrgId;
        // Check if the current pathname already includes organizationId
        if (!pathname.includes(orgId)) {
          // Avoid overriding nested routes
          router.replace(`/organizations/${orgId}`);
        }
      } else {
        router.push('/dashboard'); // Redirect to dashboard if no organizationId
        return;
      }
    }

    setOrganizationId(orgId);
  }, [paramOrgId, pathname, router]);

  // Fetch the organization name
  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const loadOrganizationName = async () => {
      try {
        setLoading(true);
        const organization = await fetchOrganizationById(organizationId);
        if (organization) setOrganizationName(organization.name);
      } catch (error) {
        console.error('Error fetching organization name:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationName();
  }, [organizationId]);

  return { organizationId, organizationName, loading };
};
