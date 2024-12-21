import { db } from '@shared/services/firebase';
import { EndOfDayReport, OwnerReport } from '@shared/types/report';
import { SaleData } from '@shared/types/transaction';
import { getLocalDate } from '@shared/utils/params';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

export const saveEndOfDayReport = async (
  reportData: EndOfDayReport
): Promise<void> => {
  try {
    const { organizationId, date } = reportData;

    // Construct document ID as `organizationId_date` for unique daily reports
    const reportId = `${organizationId}_${date}`;

    // Reference to the Firestore collection
    const reportsCollection = collection(db, 'endOfDayReports');
    const reportDoc = doc(reportsCollection, reportId);

    // Save the report to Firestore
    await setDoc(reportDoc, reportData);

    console.log('End-of-Day Report saved successfully:', reportData);
  } catch (error) {
    console.error('Error saving end-of-day report:', error);
    throw new Error('Failed to save the end-of-day report.');
  }
};

export const fetchEmployeeReport = async (
  organizationId: string,
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; totalSales: number }[]> => {
  if (!employeeId) {
    throw new Error('Employee ID is required to fetch employee report');
  }

  const startTimestamp = startOfDay(parseISO(startDate)).toISOString();
  const endTimestamp = endOfDay(parseISO(endDate)).toISOString();

  const salesCollection = collection(db, 'sales');
  const salesQuery = query(
    salesCollection,
    where('organizationId', '==', organizationId),
    where('employeeId', '==', employeeId),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp)
  );

  const querySnapshot = await getDocs(salesQuery);

  const salesByDate: Record<string, number> = {};
  querySnapshot.forEach((doc) => {
    const { createdAt, amount } = doc.data();
    const date = getLocalDate(createdAt).split('T')[0]; // Extract date
    if (!salesByDate[date]) salesByDate[date] = 0;
    salesByDate[date] += amount;
  });

  return Object.keys(salesByDate).map((date) => ({
    date,
    totalSales: salesByDate[date],
  }));
};

interface FetchOrganizationSalesParams {
  organizationId: string;
  startDate: string;
  endDate: string;
}

export const fetchOrganizationSalesReport = async ({
  organizationId,
  startDate,
  endDate,
}: FetchOrganizationSalesParams) => {
  const salesCollection = collection(db, 'sales');

  const startTimestamp = startOfDay(parseISO(startDate)).toISOString();
  const endTimestamp = endOfDay(parseISO(endDate)).toISOString();

  const salesQuery = query(
    salesCollection,
    where('organizationId', '==', organizationId),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp)
  );

  const querySnapshot = await getDocs(salesQuery);

  const reportMap: Record<
    string,
    { totalSale: number; employees: Record<string, number> }
  > = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.createdAt.split('T')[0];
    if (!reportMap[date]) {
      reportMap[date] = { totalSale: 0, employees: {} };
    }

    reportMap[date].totalSale += data.amount;

    const employeeId = data.employeeId;
    reportMap[date].employees[employeeId] =
      (reportMap[date].employees[employeeId] || 0) + data.amount;
  });

  return Object.entries(reportMap).map(([date, { totalSale, employees }]) => ({
    date,
    totalSale,
    employeeSummaries: Object.entries(employees).map(([employeeId, total]) => ({
      employeeId,
      employeeName: `Employee ${employeeId}`, // Replace with actual lookup if needed
      totalSale: total,
    })),
  }));
};

interface FetchEmployeeSalesByDateParams {
  organizationId: string;
  employeeId: string;
  date: string; // Expected in 'yyyy-MM-dd' format
}

export const fetchEmployeeSalesByDate = async ({
  organizationId,
  employeeId,
  date,
}: FetchEmployeeSalesByDateParams): Promise<SaleData[]> => {
  // Convert the date into the start and end times
  const startTimestamp = startOfDay(parseISO(date)).toISOString();
  const endTimestamp = endOfDay(parseISO(date)).toISOString();

  const salesCollection = collection(db, 'sales');
  const salesQuery = query(
    salesCollection,
    where('organizationId', '==', organizationId),
    where('employeeId', '==', employeeId),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp)
  );

  const querySnapshot = await getDocs(salesQuery);

  // Map Firestore documents to the SaleData type
  return querySnapshot.docs.map((doc) => ({
    ...(doc.data() as SaleData),
  }));
};

export const fetchOwnerReport = async (
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<OwnerReport[]> => {
  const startTimestamp = startOfDay(parseISO(startDate)).toISOString();
  const endTimestamp = endOfDay(parseISO(endDate)).toISOString();

  const reportsCollection = collection(db, 'endOfDayReports');
  const reportsQuery = query(
    reportsCollection,
    where('organizationId', '==', organizationId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const querySnapshot = await getDocs(reportsQuery);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      date: data.date,
      totalSales: data.totalSale,
      employeeSummaries: data.employeeSummaries, // Summaries for each employee
    };
  });
};

export const fetchSalesDetailsByDate = async (
  organizationId: string,
  date: string
) => {
  const salesCollection = collection(db, 'endOfDayReports');
  const salesQuery = query(
    salesCollection,
    where('organizationId', '==', organizationId),
    where('date', '==', date) // Match the specific date
  );

  const querySnapshot = await getDocs(salesQuery);
  if (querySnapshot.empty) {
    return [];
  }

  const details = querySnapshot.docs.map((doc) => {
    const data = doc.data().employeeSummaries;
    return {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      totalSale: data.totalSale,
      sales: data.sales, // Include sales details for employees
    };
  });

  return details;
};
