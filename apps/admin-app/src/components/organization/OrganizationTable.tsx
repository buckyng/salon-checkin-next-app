import { Button } from '@shared/components/ui/button';
import { Organization } from '@shared/types/organization';

interface OrganizationTableProps {
  organizations: Organization[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAssignOwner: (orgId: string) => void;
  loading: boolean;
}

const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
  onEdit,
  onDelete,
  onAssignOwner,
  loading,
}) => {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (organizations.length === 0) {
    return <p>No organizations found.</p>;
  }

  return (
    <table className="w-full border border-collapse border-gray-300">
      <thead>
        <tr>
          <th className="px-4 py-2 border border-gray-300">Name</th>
          <th className="px-4 py-2 border border-gray-300">Owner</th>
          <th className="px-4 py-2 border border-gray-300">Actions</th>
        </tr>
      </thead>
      <tbody>
        {organizations.map((org) => (
          <tr key={org.id}>
            <td className="px-4 py-2 border border-gray-300">{org.name}</td>
            <td className="px-4 py-2 border">
              {org.owner ? org.owner.email : 'No Owner'}
            </td>
            <td className="px-4 py-2 space-x-2 border border-gray-300">
              <Button onClick={() => onAssignOwner(org.id)}>
                Assign Owner
              </Button>
              <Button onClick={() => onEdit(org.id, org.name)}>Edit</Button>
              <Button
                variant="destructive"
                onClick={() => confirm('Are you sure?') && onDelete(org.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrganizationTable;
