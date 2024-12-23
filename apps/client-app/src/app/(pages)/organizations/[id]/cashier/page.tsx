'use client';

import React, { use, useEffect, useState } from 'react';
import {
  fetchOrganizationSales,
  updateSale,
} from '@shared/services/saleService';
import { SaleData } from '@shared/types/transaction';
import { DataTable } from '@shared/components/ui/data-table';
import { Button } from '@shared/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useOrganization } from '@/app/hooks/useOrganization';
import { useRouter } from 'next/navigation';
import { fetchUserRoles } from '@shared/services/organizationService';
import { withAuth } from '@shared/components/hoc/withAuth';
import { ColumnDef } from '@tanstack/react-table';
import { formatLocalTime } from '@shared/utils/formatDate';

interface GroupedSale {
  comboNum?: number | null;
  sales: SaleData[];
  totalAmount: number;
}

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

const CashierPage = ({ params }: PageProps) => {
  const { organizationId, organizationName, loading } = useOrganization(
    use(params).organizationId
  );
  const [sales, setSales] = useState<GroupedSale[]>([]);
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const router = useRouter();

  useEffect(() => {
    if (!organizationId) return;

    const loadSales = async () => {
      const salesData = await fetchOrganizationSales({
        organizationId,
        date: currentDate,
        paid: false,
      });

      // Group sales by comboNum
      const groupedSales = salesData.reduce<GroupedSale[]>((acc, sale) => {
        const comboGroup = acc.find(
          (group) => group.comboNum === sale.comboNum
        );
        if (comboGroup) {
          comboGroup.sales.push(sale);
          comboGroup.totalAmount += sale.amount;
        } else {
          acc.push({
            comboNum: sale.comboNum || null,
            sales: [sale],
            totalAmount: sale.amount,
          });
        }
        return acc;
      }, []);

      // Sort the groups: Place "No Combo" at the end
      groupedSales.sort((a, b) => {
        if (a.comboNum === null) return 1; // "No Combo" goes last
        if (b.comboNum === null) return -1; // Other combos come first
        return (a.comboNum || 0) - (b.comboNum || 0); // Sort by comboNum
      });

      setSales(groupedSales);
    };

    loadSales();
  }, [organizationId, currentDate]);

  const handleMarkPaid = async (saleId: string, comboNum: number | null) => {
    try {
      await updateSale(saleId, { paid: true });

      // Update UI
      setSales((prev) => {
        return prev
          .map((group) => {
            if (group.comboNum === comboNum) {
              const updatedSales = group.sales.filter(
                (sale) => sale.id !== saleId
              );
              return updatedSales.length > 0
                ? {
                    ...group,
                    sales: updatedSales,
                    totalAmount: updatedSales.reduce(
                      (total, sale) => total + sale.amount,
                      0
                    ),
                  }
                : null;
            }
            return group;
          })
          .filter((group) => group !== null) as GroupedSale[]; // Remove empty groups
      });

      toast.success('Sale marked as paid!');
    } catch (error) {
      console.error('Error marking sale as paid:', error);
      toast.error('Failed to mark sale.');
    }
  };

  const handleMarkPaidAll = async (group: GroupedSale) => {
    try {
      // Mark all sales in the group as paid
      await Promise.all(
        group.sales.map((sale) => updateSale(sale.id, { paid: true }))
      );

      // Update UI
      setSales((prev) => prev.filter((g) => g.comboNum !== group.comboNum));

      toast.success(
        `All sales for Combo ${group.comboNum || 'No Combo'} marked as paid!`
      );
    } catch (error) {
      console.error('Error marking all sales as paid:', error);
      toast.error('Failed to mark all sales as paid.');
    }
  };

  const handleEditSale = (sale: SaleData) => {
    const newAmount = prompt('Enter new amount:', sale.amount.toString());
    if (!newAmount) return;

    try {
      updateSale(sale.id, { amount: parseFloat(newAmount) });
      setSales((prev) =>
        prev.map((group) => {
          if (group.comboNum === sale.comboNum) {
            return {
              ...group,
              sales: group.sales.map((s) =>
                s.id === sale.id ? { ...s, amount: parseFloat(newAmount) } : s
              ),
              totalAmount: group.sales.reduce(
                (total, s) =>
                  s.id === sale.id
                    ? total + parseFloat(newAmount) - s.amount
                    : total + s.amount,
                0
              ),
            };
          }
          return group;
        })
      );
      toast.success('Sale updated successfully!');
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Failed to update sale.');
    }
  };

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Time',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => formatLocalTime(getValue<string>()),
    },
    { header: 'Employee Name', accessorKey: 'employeeName' },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button onClick={() => handleEditSale(row.original)}>Edit</Button>
          <Button
            onClick={() =>
              handleMarkPaid(row.original.id, row.original.comboNum || null)
            }
          >
            Mark Paid
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center">Loading sales...</p>;
  }

  return (
    <div className="container mx-auto mt-6">
      <h1 className="text-2xl font-bold">Cashier - {organizationName}</h1>
      <p className="mb-4 text-gray-600">Date: {currentDate}</p>
      <div className="flex justify-between">
        <Button
          onClick={() => {
            router.push(
              `/organizations/${organizationId}/cashier/history-cashier`
            );
          }}
        >
          View History
        </Button>

        <Button
          onClick={() => {
            router.push(
              `/organizations/${organizationId}/cashier/report-cashier`
            );
          }}
        >
          End of Day
        </Button>
      </div>

      {/* Warning message for no sales */}
      {sales.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">
          <p>No sales to display for today.</p>
        </div>
      ) : (
        sales.map((group) => (
          <div key={group.comboNum || 'no-combo'} className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Combo {group.comboNum || 'No Combo'} - Total: $
                {group.totalAmount.toFixed(2)}
              </h2>
              {group.comboNum && (
                <Button
                  variant="destructive"
                  onClick={() => handleMarkPaidAll(group)}
                >
                  Mark Paid All
                </Button>
              )}
            </div>
            <DataTable columns={columns} data={group.sales} />
          </div>
        ))
      )}
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
export default withAuth(CashierPage, {
  allowedRoles: ['cashier'],
  validateRole: validateEmployeeRole,
});
