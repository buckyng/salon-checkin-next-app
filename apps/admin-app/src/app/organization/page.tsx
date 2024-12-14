'use client';

import { useEffect, useState } from 'react';
import {
  fetchOrganizations,
  addOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/services/organizationService';
import OrganizationTable from '@/components/organization/OrganizationTable';
import AddOrganizationDialog from '@/components/organization/AddOrganizationDialog';
import EditOrganizationDialog from '@/components/organization/EditOrganizationDialog';
import AssignOwnerDialog from '@/components/organization/AssignOwnerDialog';
import { Organization } from '@shared/types/organization';
import { toast } from 'react-toastify';
import {
  assignOwnerRole,
  removeOwnerRole,
} from '@shared/services/organizationService';
import { fetchUserByEmail } from '@shared/services/userService';

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [currentEditOrg, setCurrentEditOrg] = useState<Organization | null>(
    null
  );

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const orgs = await fetchOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = async (name: string) => {
    try {
      await addOrganization(name);
      await loadOrganizations();
    } catch (error) {
      console.error('Error adding organization:', error);
      toast.error('Error adding organization. Please try again.');
    }
  };

  const handleUpdateOrganization = async (id: string, name: string) => {
    try {
      await updateOrganization(id, name);
      await loadOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Error updating organization. Please try again.');
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    try {
      await deleteOrganization(id);
      await loadOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Error deleting organization. Please try again.');
    }
  };

  const handleAssignOwner = async (
    email: string
  ): Promise<'success' | 'user-not-found'> => {
    if (!selectedOrgId) return 'user-not-found';

    setAssigning(true);
    try {
      // Fetch user details by email
      const user = await fetchUserByEmail(email);
      if (!user) {
        toast.error('User with the given email does not exist.');
        return 'user-not-found';
      }

      // Assign the owner role
      await assignOwnerRole(selectedOrgId, user.uid, email);
      toast.success('Owner assigned successfully!');
      await loadOrganizations();
      return 'success';
    } catch (error) {
      console.error('Error assigning owner:', error);
      toast.error(error.message || 'Failed to assign owner.');
      return 'user-not-found';
    } finally {
      setAssigning(false);
      setSelectedOrgId(null);
    }
  };

  const handleRemoveOwner = async (organizationId: string, userId: string) => {
    setRemoving(true);
    try {
      await removeOwnerRole(organizationId, userId);
      toast.success('Owner removed successfully!');
      await loadOrganizations();
    } catch (error) {
      console.error('Error removing owner:', error);
      toast.error(error.message || 'Failed to remove owner.');
    } finally {
      setRemoving(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <div className="container px-4 mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add Organization
        </button>
      </div>
      <OrganizationTable
        organizations={organizations}
        onEdit={(id, name) => {
          setCurrentEditOrg({
            id,
            name,
            createdAt: new Date(),
            owner: { email: '', uid: '' },
          }); // Dummy createdAt for editing
          setShowEditDialog(true);
        }}
        onDelete={handleDeleteOrganization}
        onAssignOwner={(orgId) => setSelectedOrgId(orgId)}
        onRemoveOwner={handleRemoveOwner}
        loading={loading || removing}
      />
      <AssignOwnerDialog
        isOpen={!!selectedOrgId}
        onClose={() => setSelectedOrgId(null)}
        onAssign={handleAssignOwner}
        assigning={assigning}
      />
      <AddOrganizationDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddOrganization}
      />
      {currentEditOrg && (
        <EditOrganizationDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={(newName) =>
            handleUpdateOrganization(currentEditOrg.id, newName)
          }
          currentName={currentEditOrg.name}
        />
      )}
    </div>
  );
};

export default OrganizationPage;
