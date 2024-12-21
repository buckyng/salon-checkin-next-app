import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchOrganizationById } from '@shared/services/organizationService';

export const useOrganization = (paramOrgId?: string) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let orgId = paramOrgId;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      const storedRole = localStorage.getItem('selectedRole');

      if (storedOrgId && storedRole) {
        orgId = storedOrgId;
        setSelectedRole(storedRole);
      } else {
        // Redirect user back to dashboard if no orgId or role is selected
        router.push('/dashboard');
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

  // Fetch the selected role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    if (storedRole) {
      setSelectedRole(storedRole);
    }
  }, []);

  return {
    organizationId,
    organizationName,
    selectedRole,
    setOrganizationId, // Allow manually setting organizationId
    setSelectedRole, // Allow manually setting selectedRole
    loading,
  };
};
