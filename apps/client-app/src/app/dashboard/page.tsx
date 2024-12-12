'use client';

import { Button } from '@shared/components/ui/button';
import { SignOutButton } from '@shared/components/ui/signout-button';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="destructive">Sign Out</Button>
        <SignOutButton />
      </div>
    </div>
  );
};

export default AdminDashboard;
