'use client';

import { Button } from '@shared/components/ui/button';
import { useAuth } from '@shared/contexts/UserContext';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { user } = useAuth(); // Fetch user and logout from context
  const router = useRouter();

  return (
    <div className="container px-4 mx-auto mt-10">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Welcome Text */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-700">
          Welcome, {user?.email}
        </h2>
      </div>

      {/* Buttons Section */}
      <div className="flex flex-col gap-4">
        <Button
          variant="default"
          size="lg"
          className="w-full md:w-1/2"
          onClick={() => router.push('/organization')}
        >
          Manage Organization
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full md:w-1/2"
          onClick={() => router.push('/users')}
        >
          Manage Users
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
