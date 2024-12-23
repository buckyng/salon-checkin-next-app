'use client';

import React, { use, useEffect, useState } from 'react';
import {
  fetchOrganizationSales,
  updateSale,
} from '@shared/services/saleService';
import { SaleData } from '@shared/types/transaction';
import { DataTable } from '@shared/components/ui/data-table';
import { Button } from '@shared/components/ui/button';
import { format, parseISO } from 'date-fns';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import { toast } from 'react-toastify';
import { useOrganization } from '@/app/hooks/useOrganization';
import { useRouter } from 'next/navigation';
import { fetchUserRoles } from '@shared/services/organizationService';
import { withAuth } from '@shared/components/hoc/withAuth';
import { ColumnDef } from '@tanstack/react-table';

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

const HistoryCashierPage = ({ params }: PageProps) => {
  const { organizationId, organizationName, loading } = useOrganization(
    use(params).organizationId
  );
  const [sales, setSales] = useState<SaleData[]>([]);
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const router = useRouter();

  useEffect(() => {
    if (!organizationId) return;

    const loadSales = async () => {
      const salesData = await fetchOrganizationSales({
        organizationId,
        date: currentDate,
        paid: true, // Fetch only paid sales
      });

      setSales(salesData);
    };

    loadSales();
  }, [organizationId, currentDate]);

  const handleMarkUnpaid = async (saleId: string) => {
    try {
      await updateSale(saleId, { paid: false });

      // Update UI
      setSales((prev) => prev.filter((sale) => sale.id !== saleId));

      toast.success('Sale marked as unpaid!');
    } catch (error) {
      console.error('Error marking sale as unpaid:', error);
      toast.error('Failed to mark sale as unpaid.');
    }
  };

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Time',
      accessorKey: 'createdAt', // Ensure this matches the key in SaleData
      cell: ({ row }) => {
        const localTime = toZonedTime(
          parseISO(row.getValue('createdAt')),
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );
        return tzFormat(localTime, 'HH:mm:ss');
      },
    },
    { header: 'Employee Name', accessorKey: 'employeeName' },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => `$${row.getValue<number>('amount').toFixed(2)}`,
    },
    {
      header: 'Combo',
      accessorKey: 'comboNum',
      cell: ({ row }) => `${row.getValue<number>('comboNum') || ''}`,
    },
    {
      header: 'Actions',
      accessorKey: 'id', // This matches `SaleData.id`
      cell: ({ row }) => (
        <Button onClick={() => handleMarkUnpaid(row.original.id)}>
          Mark Unpaid
        </Button>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center">Loading sales...</p>;
  }

  return (
    <div className="container mx-auto mt-6">
      <h1 className="text-2xl font-bold">History - {organizationName}</h1>
      <p className="mb-4 text-gray-600">Date: {currentDate}</p>

      <Button
        onClick={() => router.push(`/organizations/${organizationId}/cashier`)}
        className="mb-4"
      >
        Back to Cashier
      </Button>

      <DataTable columns={columns} data={sales} />
    </div>
  );
};

// Role Validation Function
const validateEmployeeRole = async (
  user: { uid: string },
  organizationId: string
) => {
  const roles = await fetchUserRoles(user.uid, organizationId);
  return roles.map((role) => role.roles).flat();
};

// Protect the Employee Page
export default withAuth(HistoryCashierPage, {
  allowedRoles: ['cashier'],
  validateRole: validateEmployeeRole,
});
