'use client';

import { Button } from '@shared/components/ui/button';

const OrganizationTable = ({
  organizations,
  onEdit,
  onDelete,
  onAssignOwner,
  onRemoveOwner,
  loading,
}: {
  organizations: {
    id: string;
    name: string;
    owner?: { email: string; uid: string };
  }[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAssignOwner: (orgId: string) => void;
  onRemoveOwner: (orgId: string, userId: string) => void;
  loading: boolean;
}) => {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Owner</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={3} className="py-4 text-center">
              Loading...
            </td>
          </tr>
        ) : (
          organizations.map((org) => (
            <tr key={org.id}>
              <td className="px-4 py-2 border">{org.name}</td>
              <td className="px-4 py-2 border">
                {org.owner ? org.owner.email : 'No Owner'}
              </td>
              <td className="flex gap-2 px-4 py-2 border">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onEdit(org.id, org.name)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(org.id)}
                >
                  Delete
                </Button>
                {org.owner ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onRemoveOwner(org.id, org.owner.uid)}
                  >
                    Remove Owner
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onAssignOwner(org.id)}
                  >
                    Assign Owner
                  </Button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default OrganizationTable;
