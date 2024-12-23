'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@shared/components/ui/switch';
import {
  fetchCheckInsToday,
  fetchClientById,
  updateCheckInServiceStatus,
} from '@shared/services/checkInService';
import { useOrganization } from '@/app/hooks/useOrganization';
import { CheckInData } from '@shared/types/transaction';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@shared/components/ui/data-table';
import { formatLocalTime } from '@shared/utils/formatDate';

const CheckInManagementPage = () => {
  const { organizationId } = useOrganization();
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleService = async (
    id: string | undefined,
    isInService: boolean
  ) => {
    if (!organizationId || !id) return;
    try {
      await updateCheckInServiceStatus(organizationId, id, isInService);
      setCheckIns((prevCheckIns) => {
        // Update the `isInService` value for the specific check-in
        const updatedCheckIns = prevCheckIns.map((checkIn) =>
          checkIn.id === id ? { ...checkIn, isInService } : checkIn
        );

        // Reorder the array: `isInService: false` first, then `checkInTime` ascending
        return updatedCheckIns.sort((a, b) => {
          if (a.isInService === b.isInService) {
            return (
              new Date(a.checkInTime).getTime() -
              new Date(b.checkInTime).getTime()
            );
          }
          return a.isInService ? 1 : -1;
        });
      });
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  useEffect(() => {
    if (!organizationId) return;
    const loadCheckIns = async () => {
      try {
        setLoading(true);
        const checkInsData = await fetchCheckInsToday(organizationId);

        // Add visitsBeforeToday and lastVisitRating from client data
        const enrichedCheckIns = await Promise.all(
          checkInsData.map(async (checkIn) => {
            try {
              const clientData = await fetchClientById(
                organizationId,
                checkIn.clientId
              );
              return {
                ...checkIn,
                visitsBeforeToday: clientData.visitsBeforeToday || 0,
                lastVisitRating: clientData.lastVisitRating || null,
              };
            } catch (error) {
              console.error(
                `Error fetching client data for ${checkIn.clientId}:`,
                error
              );
              return {
                ...checkIn,
                visitsBeforeToday: 0,
                lastVisitRating: null,
              };
            }
          })
        );

        // Sort the enriched data
        const sortedCheckIns = enrichedCheckIns.sort((a, b) => {
          if (a.isInService === b.isInService) {
            return (
              new Date(a.checkInTime).getTime() -
              new Date(b.checkInTime).getTime()
            );
          }
          return a.isInService ? 1 : -1; // Move isInService === true to the end
        });

        setCheckIns(sortedCheckIns);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCheckIns();
  }, [organizationId]);

  const columns: ColumnDef<CheckInData>[] = [
    {
      header: 'Time',
      accessorKey: 'checkInTime',
      cell: ({ getValue }) => formatLocalTime(getValue<string>()),
    },
    { header: 'Client Name', accessorKey: 'clientName' },
    {
      header: 'Visits Before Today',
      accessorKey: 'visitsBeforeToday',
    },
    {
      header: 'Last Visit Rating',
      accessorKey: 'lastVisitRating',
    },
    {
      header: 'Actions',
      accessorKey: 'isInService',
      cell: ({ row, getValue }) => (
        <Switch
          checked={getValue<boolean>()}
          onCheckedChange={(checked) =>
            handleToggleService(row.original.id, checked)
          }
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container px-4 mx-auto mt-10">
        <h1 className="mb-6 text-3xl font-bold">Check-In Management</h1>
        <p>Loading check-ins...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto mt-10">
      <h1 className="mb-6 text-3xl font-bold">Check-In Management</h1>
      <DataTable columns={columns} data={checkIns} />
    </div>
  );
};

export default CheckInManagementPage;
