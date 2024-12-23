import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrganizationById } from '@shared/services/organizationService';
import { PLACEHOLDER_LOGO_URL } from '../constants/stringConstants';

export const useOrganization = (paramOrgId?: string) => {
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [organizationLogoUrl, setOrganizationLogoUrl] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOrganizationName = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const organization = await fetchOrganizationById(organizationId);
      if (organization) {
        setOrganizationName(organization.name);
        setOrganizationLogoUrl(organization.logoUrl || PLACEHOLDER_LOGO_URL);
      }
    } catch (error) {
      console.error('Error fetching organization name:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let orgId = paramOrgId;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      const storedRole = localStorage.getItem('selectedRole');

      if (storedOrgId && storedRole) {
        orgId = storedOrgId;
        setSelectedRole(storedRole);
        loadOrganizationName();
      } else {
        // Redirect user back to dashboard if no orgId or role is selected
        router.push('/dashboard');
        return;
      }
    }

    setOrganizationId(orgId);
  }, [loadOrganizationName, paramOrgId, router]);

  return {
    organizationId,
    organizationName,
    organizationLogoUrl,
    selectedRole,
    setOrganizationId, // Allow manually setting organizationId
    setSelectedRole, // Allow manually setting selectedRole
    loading,
  };
};
