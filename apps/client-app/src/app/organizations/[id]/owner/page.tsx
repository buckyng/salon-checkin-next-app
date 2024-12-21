'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/app/hooks/useOrganization';

const OwnerPage = () => {
  const { organizationId, organizationName } = useOrganization();
  const router = useRouter();

  if (!organizationId) {
    return <p className="text-center">Loading organization details...</p>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="mb-6 text-2xl font-bold text-center">
        {organizationName || 'Your Organization'}
      </h1>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => router.push(`/organizations/${organizationId}/users`)}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Manage Users
        </button>
        <button
          onClick={() => router.push(`/organizations/${organizationId}/owner/report`)}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          View Reports
        </button>
      </div>
    </div>
  );
};

export default OwnerPage;
