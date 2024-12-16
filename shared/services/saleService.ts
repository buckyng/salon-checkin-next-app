import { FirestoreCollections } from '@shared/constants/firestoreCollections';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { NewSaleData, SaleData } from '@shared/types/transaction';
import { startOfDay, endOfDay, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface FetchSalesParams {
  organizationId: string;
  employeeId: string;
  date: string; // Local date in 'yyyy-MM-dd' format
}

export const addSale = async (saleData: NewSaleData): Promise<void> => {
  try {
    const salesCollection = collection(db, 'sales');

    // Validate saleData
    if (!saleData.organizationId) {
      throw new Error('organizationId is required.');
    }
    if (!saleData.employeeId) {
      throw new Error('employeeId is required.');
    }
    if (!saleData.amount || isNaN(saleData.amount)) {
      throw new Error('amount must be a valid number.');
    }

    // Add to Firestore
    await addDoc(salesCollection, saleData);

    console.log('Sale added successfully:', saleData);
  } catch (error) {
    console.error('Error adding sale:', error);
    throw new Error('Failed to add sale');
  }
};

interface FetchSalesParams {
  organizationId: string;
  employeeId: string;
  date: string; // Local date in 'yyyy-MM-dd' format
}

/**
 * Converts a local date to UTC ISO string.
 * @param date Local date object
 * @returns UTC ISO string
 */
const localToUtc = (date: Date): string => {
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Adjust for timezone offset
  return utcDate.toISOString();
};

export const fetchOrganizationSales = async ({
  organizationId,
  employeeId,
  date,
}: FetchSalesParams): Promise<SaleData[]> => {
  // User's local time zone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Parse the date as a local date
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date()); // Parse as local date
  const localStartOfDay = startOfDay(parsedDate); // Start of day in local time
  const localEndOfDay = endOfDay(parsedDate); // End of day in local time

  // Convert local times to UTC
  const utcStartOfDay = toZonedTime(localStartOfDay, timeZone);
  const utcEndOfDay = toZonedTime(localEndOfDay, timeZone);

  const salesCollection = collection(db, 'sales');
  const salesQuery = query(
    salesCollection,
    where('organizationId', '==', organizationId),
    where('employeeId', '==', employeeId),
    where('createdAt', '>=', utcStartOfDay.toISOString()),
    where('createdAt', '<=', utcEndOfDay.toISOString())
  );

  const querySnapshot = await getDocs(salesQuery);

  // Map Firestore documents to the Sale type
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id, // Document ID
      createdAt: data.createdAt || '', // ISO string expected
      amount: data.amount || 0, // Default to 0 if missing
      note: data.note || '', // Default to empty string if missing
      comboNum: data.comboNum || 0, // Default to 0 if missing
      employeeId: data.employeeId || '',
      organizationId: data.organizationId || '',
    } as SaleData;
  });
};
