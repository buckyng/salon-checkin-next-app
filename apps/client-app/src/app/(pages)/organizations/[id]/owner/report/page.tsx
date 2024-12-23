'use client';

import React, { useState } from 'react';
import { useOrganization } from '@/app/hooks/useOrganization';
import { DataTable } from '@shared/components/ui/data-table';
import { DatePicker } from '@shared/components/ui/date-picker';
import { Button } from '@shared/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import {
  DetailsReportAllEmployees,
  OwnerReport,
  salesOfEmployeeEndOfDay,
} from '@shared/types/report';
import { fetchOwnerReport } from '@shared/services/reportService';
import { format, parseISO } from 'date-fns';
import BackButton from '@shared/components/ui/BackButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components/ui/popover';
import { formatLocalTime } from '@shared/utils/formatDate';

const OwnerReportPage = () => {
  const { organizationId, organizationName } = useOrganization();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<OwnerReport[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [details, setDetails] = useState<DetailsReportAllEmployees[]>([]);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<OwnerReport>[] = [
    { header: 'Date', accessorKey: 'date' },
    {
      header: 'Total Sales',
      accessorKey: 'totalSales',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <Button onClick={() => handleRowClick(row.original.date)}>
          View Details
        </Button>
      ),
    },
  ];

  const fetchReport = async () => {
    if (!organizationId || !startDate || !endDate) return;

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

      const report = await fetchOwnerReport(
        organizationId,
        formattedStartDate,
        formattedEndDate
      );
      setReportData(report);
    } catch (error) {
      console.error('Error fetching owner report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (date: string) => {
    const detailsForDate = reportData.find((summary) => summary.date === date);

    if (detailsForDate) {
      setDetails(detailsForDate.employeeSummaries); // Set the sales details for the selected date
    } else {
      setDetails([]); // No details for the selected date
    }
    setSelectedDate(date);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
  };

  return (
    <div className="container mx-auto mt-6">
      <BackButton fallbackUrl={`/organizations/${organizationId}/owner`} />
      <h1 className="mb-4 text-2xl font-bold">
        Owner Report - {organizationName}
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

      {/* Main Report Table */}
      {loading ? (
        <p className="text-center">Loading report...</p>
      ) : (
        <DataTable columns={columns} data={reportData} />
      )}

      {/* Detailed Sales Table */}
      {selectedDate && (
        <div className="mt-6">
          <h2 className="text-lg font-bold">
            Detailed Sales for {format(parseISO(selectedDate), 'MMMM d, yyyy')}
          </h2>
          <DataTable
            columns={[
              { header: 'Employee Name', accessorKey: 'employeeName' },
              { header: 'Total Sale', accessorKey: 'totalSale' },
              {
                header: 'Actions',
                accessorKey: 'date',
                cell: ({ row }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button>View Details</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="p-4">
                        <h3 className="mb-2 text-lg font-semibold">
                          Sales Details - {row.original.employeeName}
                        </h3>
                        <table className="min-w-full text-left border border-gray-200">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2">Time</th>
                              <th className="px-4 py-2">Amount</th>
                              <th className="px-4 py-2">Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.original.sales.map(
                              (
                                sale: salesOfEmployeeEndOfDay,
                                index: number
                              ) => (
                                <tr key={index} className="border-b">
                                  <td className="px-4 py-2">
                                    {formatLocalTime(sale.createdAt)}
                                  </td>
                                  <td className="px-4 py-2">{`$${sale.amount}`}</td>
                                  <td className="px-4 py-2">
                                    {sale.note || ''}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </PopoverContent>
                  </Popover>
                ),
              },
            ]}
            data={details}
          />
        </div>
      )}
    </div>
  );
};

export default OwnerReportPage;
