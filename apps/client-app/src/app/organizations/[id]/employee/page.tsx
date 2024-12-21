'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';
import { fetchOrganizationSalesOfEmployee } from '@shared/services/saleService';
import { DataTable } from '@shared/components/ui/data-table';
import { Button } from '@shared/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { SaleData } from '@shared/types/transaction';
import { fetchUserRoles } from '@shared/services/organizationService';
import { withAuth } from '@shared/components/hoc/withAuth';
import { useOrganization } from '@/app/hooks/useOrganization';
import { formatLocalTime } from '@shared/utils/formatDate';

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

const EmployeeHomePage = ({ params }: PageProps) => {
  const { user } = useAuth();
  const { organizationId, organizationName } = useOrganization(
    use(params).organizationId
  );
  const router = useRouter();

  const [sales, setSales] = useState<SaleData[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);

  const currentDate = format(new Date(), 'yyyy-MM-dd'); // Local date

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Index',
      accessorFn: (_row, index) => index + 1,
      cell: ({ getValue }) => getValue(),
    },
    {
      header: 'Time',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => formatLocalTime(getValue<string>()),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Combo',
      accessorKey: 'comboNum',
      cell: ({ getValue }) => getValue() || '',
    },
    {
      header: 'Note',
      accessorKey: 'note',
      cell: ({ getValue }) => getValue() || '',
    },
  ];

  // Fetch sales data
  useEffect(() => {
    if (!user || !organizationId) return;

    const fetchSales = async () => {
      try {
        const salesData = await fetchOrganizationSalesOfEmployee({
          organizationId,
          employeeId: user.uid,
          date: currentDate,
        });
        setSales(salesData);

        const total = salesData.reduce((sum, sale) => sum + sale.amount, 0);
        setTotalSales(total);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };

    fetchSales();
  }, [user, organizationId, currentDate]);

  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-2xl font-bold">
        {organizationName
          ? `${organizationName} - Today's Sales`
          : "Today's Sales"}
      </h1>
      <p className="text-gray-600">Date: {currentDate}</p>

      <div className="my-4">
        <Button
          onClick={() =>
            router.push(`/organizations/${organizationId}/employee/add-sale`)
          }
        >
          Add Sale
        </Button>

        <Button
          onClick={() =>
            router.push(`/organizations/${organizationId}/employee/report`)
          }
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          View Reports
        </Button>
      </div>

      <div className="my-4">
        <h2 className="text-lg font-bold">
          Total Sales: ${totalSales.toFixed(2)}
        </h2>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-bold">Today&apos;s Sales</h3>
        <DataTable columns={columns} data={sales} />
      </div>
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
export default withAuth(EmployeeHomePage, {
  allowedRoles: ['employee'],
  validateRole: validateEmployeeRole,
});
