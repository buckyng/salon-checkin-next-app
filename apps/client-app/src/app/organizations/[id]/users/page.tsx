'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext'; // Import your authentication context
import {
  fetchUsersByOrganization,
  addUserToOrganization,
  updateUserRoles,
  removeUserFromOrganization,
  fetchUserRolesByOrganization,
} from '@shared/services/organizationService';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Checkbox } from '@shared/components/ui/checkbox';
import { toast } from 'react-toastify';
import { withAuth } from '@shared/components/hoc/withAuth';

interface OrganizationUser {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date;
}

const ManageUsersPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(); // Use authenticated user context to get `ownerId`
  const [organizationId, setOrganizationId] = useState<string>('');

  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    let orgId = params?.id as string;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      if (storedOrgId) {
        orgId = storedOrgId;
        router.push(`/organizations/${orgId}/manage-users`); // Update the URL
      } else {
        router.push('/dashboard'); // Redirect to dashboard
        return;
      }
    }

    setOrganizationId(orgId);

    const loadUsers = async () => {
      try {
        if (!user?.uid || !orgId) return;
        const orgUsers = await fetchUsersByOrganization(orgId, user.uid);
        setUsers(orgUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users.');
      }
    };

    loadUsers();
  }, [params, router, user]);

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Email is required.');
      return;
    }

    try {
      await addUserToOrganization(organizationId, newUserEmail.trim());
      toast.success('User added successfully.');
      setNewUserEmail('');
      const updatedUsers = await fetchUsersByOrganization(
        organizationId,
        user!.uid
      ); // Pass `ownerId`
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user.');
    }
  };

  const handleUpdateRoles = async (userId: string, roles: string[]) => {
    setUpdatingUser(userId);

    try {
      await updateUserRoles(organizationId, userId, roles);
      toast.success('Roles updated successfully.');
      const updatedUsers = await fetchUsersByOrganization(
        organizationId,
        user!.uid
      ); // Pass `ownerId`
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Failed to update roles.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromOrganization(organizationId, userId);
      toast.success('User removed successfully.');
      const updatedUsers = await fetchUsersByOrganization(
        organizationId,
        user!.uid
      ); // Pass `ownerId`
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user.');
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold">Manage Users</h1>

      {/* Add User Section */}
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Add User</h2>
        <div className="flex items-center gap-4">
          <Input
            type="email"
            placeholder="Enter user email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </div>

      {/* Users List Section */}
      <h2 className="mb-4 text-lg font-semibold">Users</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.userId}
            className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {user.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleRemoveUser(user.userId)}
              >
                Remove
              </Button>
            </div>

            {/* Role Management */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Roles</h3>
              <div className="flex items-center gap-4">
                {['manager', 'cashier', 'employee'].map((role) => (
                  <div key={role} className="flex items-center gap-2">
                    <Checkbox
                      checked={user.roles.includes(role)}
                      onCheckedChange={(checked) => {
                        const updatedRoles = checked
                          ? [...user.roles, role]
                          : user.roles.filter((r) => r !== role);
                        handleUpdateRoles(user.userId, updatedRoles);
                      }}
                      disabled={updatingUser === user.userId}
                    />
                    <label>{role}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Role Validation Function for Owners
const validateOwnerRole = async (
  user: { uid: string },
  organizationId: string
) => {
  const roles = await fetchUserRolesByOrganization(user.uid, organizationId);
  return roles.map((role) => role.roles).flat();
};

// Protect the Page for Owners Only
export default withAuth(ManageUsersPage, {
  allowedRoles: ['owner'],
  validateRole: validateOwnerRole,
});
