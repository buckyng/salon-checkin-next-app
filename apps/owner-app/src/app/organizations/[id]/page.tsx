'use client';

import { useRouter } from 'next/navigation';

const OrganizationDashboard = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Organization Dashboard</h1>
      <p>Managing organization ID: {id}</p>
      {/* Add management features here */}
    </div>
  );
};

export default OrganizationDashboard;
