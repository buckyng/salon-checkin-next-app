'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';
import { addSale } from '@shared/services/saleService';
import { toast } from 'react-toastify';
import { withAuth } from '@shared/components/hoc/withAuth';
import { fetchUserRoles } from '@shared/services/organizationService';

const AddSalePage = ({ params }: { params: { organizationId?: string } }) => {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [comboNum, setComboNum] = useState('');
  const [note, setNote] = useState('');
  const router = useRouter();

  // Fetch organizationId dynamically
  useEffect(() => {
    let orgId = params.organizationId;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      if (storedOrgId) {
        orgId = storedOrgId;
      } else {
        toast.error('Organization ID is missing.');
        router.push('/dashboard'); // Redirect if no orgId
        return;
      }
    }

    setOrganizationId(orgId);
  }, [params.organizationId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error('Organization ID is missing.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to add a sale.');
      return;
    }

    try {
      // Add sale to Firestore
      await addSale({
        organizationId,
        employeeId: user.uid,
        amount: parseFloat(amount),
        comboNum: parseFloat(comboNum),
        note: note || null,
        createdAt: new Date().toISOString(),
      });

      toast.success('Sale added successfully!');
      router.push(`/organizations/${organizationId}/employee`); // Navigate back to Employee Home Page
    } catch (error) {
      console.error('Error adding sale:', error);
      toast.error('Failed to add sale. Please try again.');
    }
  };

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4">
      <h1 className="mb-4 text-xl font-bold">Add Sale</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Combo Number */}
        <div>
          <label className="block text-sm font-medium">Combo Number</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={comboNum}
            onChange={(e) => setComboNum(e.target.value)}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium">Note</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

// Validate employee role function
const validateEmployeeRole = async (
  user: { uid: string },
  organizationId: string
) => {
  const roles = await fetchUserRoles(user.uid, organizationId);
  return roles.map((role) => role.roles).flat();
};

// Wrap with role validation
export default withAuth(AddSalePage, {
  allowedRoles: ['employee'],
  validateRole: validateEmployeeRole,
});
