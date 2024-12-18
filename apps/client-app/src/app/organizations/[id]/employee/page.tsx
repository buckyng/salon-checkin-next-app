'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@shared/contexts/UserContext';
import { fetchOrganizationById } from '@shared/services/organizationService';
import { fetchOrganizationSalesOfEmployee } from '@shared/services/saleService';
import { DataTable } from '@shared/components/ui/data-table';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import { Button } from '@shared/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { SaleData } from '@shared/types/transaction';
import { fetchUserRoles } from '@shared/services/organizationService';
import { withAuth } from '@shared/components/hoc/withAuth';

const EmployeeHomePage = ({
  params,
}: {
  params: { organizationId: string };
}) => {
  const { user } = useAuth();
  const { organizationId: paramOrgId } = params;
  const router = useRouter();

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>(''); // New state for organization name
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
      cell: ({ getValue }) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTime = toZonedTime(getValue<string>(), timeZone);
        return tzFormat(localTime, 'HH:mm');
      },
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

  // Ensure organizationId is defined
  useEffect(() => {
    let orgId = paramOrgId;

    if (!orgId) {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      if (storedOrgId) {
        orgId = storedOrgId;
        router.push(`/organizations/${orgId}/employee`);
      } else {
        router.push('/organizations');
        return;
      }
    }

    setOrganizationId(orgId);
  }, [paramOrgId, router]);

  // Fetch organization name
  useEffect(() => {
    if (!organizationId) return;

    const loadOrganizationName = async () => {
      try {
        const organization = await fetchOrganizationById(organizationId);
        if (organization) setOrganizationName(organization.name);
      } catch (error) {
        console.error('Error fetching organization name:', error);
      }
    };

    loadOrganizationName();
  }, [organizationId]);

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
