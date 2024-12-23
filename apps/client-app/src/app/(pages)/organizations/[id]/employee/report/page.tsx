'use client';

import React, { useState } from 'react';
import { useOrganization } from '@/app/hooks/useOrganization';
import { useAuth } from '@shared/contexts/UserContext';
import { DataTable } from '@shared/components/ui/data-table';
import { Button } from '@shared/components/ui/button';
import { EmployeeReport } from '@shared/types/report';
import {
  fetchEmployeeReport,
  fetchEmployeeSalesByDate,
} from '@shared/services/reportService';
import { ColumnDef } from '@tanstack/react-table';
import { SaleData } from '@shared/types/transaction';
import { formatLocalTime } from '@shared/utils/formatDate';
import BackButton from '@shared/components/ui/BackButton';
import { DatePicker } from '@shared/components/ui/date-picker';
import { format } from 'date-fns';

const EmployeeReportPage = () => {
  const { organizationId, organizationName } = useOrganization();
  const { user } = useAuth();

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [detailedSales, setDetailedSales] = useState<SaleData[] | null>(null);

  const fetchReport = async () => {
    if (!organizationId || !user) return;

    setLoading(true);
    try {
      const formattedStartDate = startDate
        ? format(startDate, 'yyyy-MM-dd')
        : null;
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : null;

      if (!formattedStartDate || !formattedEndDate) {
        console.error('Invalid date range');
        return;
      }

      const data = await fetchEmployeeReport(
        organizationId,
        user.uid,
        formattedStartDate,
        formattedEndDate
      );
      setReports(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (date: string) => {
    if (!organizationId || !user?.uid) return;

    try {
      const sales = await fetchEmployeeSalesByDate({
        organizationId,
        employeeId: user.uid,
        date,
      });
      setDetailedSales(sales); // Update the state with the fetched sales
    } catch (error) {
      console.error('Error fetching sales by date:', error);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
  };

  const columns: ColumnDef<EmployeeReport>[] = [
    {
      header: 'Date',
      accessorKey: 'date',
    },
    {
      header: 'Total Sales',
      accessorKey: 'totalSales',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: EmployeeReport } }) => (
        <Button onClick={() => handleRowClick(row.original.date)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-4xl p-4 mx-auto">
      <BackButton fallbackUrl={`/organizations/${organizationId}/employee`} />
      <h1 className="text-xl font-bold text-center">
        Employee Report - {organizationName}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block mb-2 text-sm font-medium">Start Date</label>
          <DatePicker value={startDate} onChange={handleStartDateChange} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">End Date</label>
          <DatePicker value={endDate} onChange={handleEndDateChange} />
        </div>
        <div className="mt-6">
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Report'}
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <DataTable columns={columns} data={reports} />
      </div>

      {detailedSales && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-bold">Detailed Sales</h2>
          <DataTable
            columns={[
              {
                header: 'Time',
                accessorKey: 'createdAt',
                cell: ({ getValue }) => formatLocalTime(getValue<string>()),
              },
              { header: 'Amount', accessorKey: 'amount' },
              { header: 'Note', accessorKey: 'note' },
            ]}
            data={detailedSales}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeReportPage;
