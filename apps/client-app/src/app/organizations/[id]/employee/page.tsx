'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';
import { fetchOrganizationSales } from '@shared/services/saleService';
import { DataTable } from '@shared/components/ui/data-table';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import { Button } from '@shared/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { SaleData } from '@shared/types/transaction';

const EmployeeHomePage = ({
  params,
}: {
  params: { organizationId: string };
}) => {
  const { user } = useAuth();
  const { organizationId } = params; // Get organizationId from URL params
  const router = useRouter();
  const [sales, setSales] = useState<SaleData[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);

  const currentDate = format(new Date(), 'yyyy-MM-dd'); // Local date

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Index',
      accessorFn: (_row, index) => index + 1, // Auto-increment index
      cell: ({ getValue }) => getValue(),
    },
    {
      header: 'Time',
      accessorKey: 'createdAt', // Matches key in Sale data
      cell: ({ getValue }) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTime = toZonedTime(getValue<string>(), timeZone);
        return tzFormat(localTime, 'HH:mm');
      },
    },
    {
      header: 'Amount',
      accessorKey: 'amount', // Matches key in Sale data
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Note',
      accessorKey: 'note', // Matches key in Sale data
      cell: ({ getValue }) => getValue() || '',
    },
  ];

  useEffect(() => {
    let orgId = organizationId;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      if (storedOrgId) {
        orgId = storedOrgId;
        router.push(`/organizations/${orgId}/employee`); // Update the URL
      } else {
        router.push('/organizations'); // Redirect to organizations selection
        return;
      }
    }

    if (!user || !orgId) return; // Ensure both user and orgId are defined

    const fetchSales = async () => {
      try {
        const salesData = await fetchOrganizationSales({
          organizationId: orgId, // Use the updated orgId,
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
  }, [user, organizationId, currentDate, router, params.organizationId]);

  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-xl font-bold">Today&apos;s Sales</h1>
      <p className="text-gray-600">Date: {currentDate}</p>

      <div className="my-4">
        <Button
          onClick={() =>
            router.push(`/organizations/${organizationId}/employee/add-sale`)
          }
        >
          Add Sale
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

export default EmployeeHomePage;
