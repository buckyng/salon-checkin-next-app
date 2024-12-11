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
import { Organization } from '@shared/types/organization';

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    }
  };

  const handleUpdateOrganization = async (id: string, name: string) => {
    try {
      await updateOrganization(id, name);
      await loadOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    try {
      await deleteOrganization(id);
      await loadOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
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
          setCurrentEditOrg({ id, name, createdAt: new Date() }); // Dummy createdAt for editing
          setShowEditDialog(true);
        }}
        onDelete={handleDeleteOrganization}
        loading={loading}
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
