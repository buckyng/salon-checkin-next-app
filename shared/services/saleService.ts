import { FirestoreCollections } from '@shared/constants/firestoreCollections';
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { NewSaleData, SaleData } from '@shared/types/transaction';
import { startOfDay, endOfDay, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface FetchSalesParamsEmployee {
  organizationId: string;
  employeeId: string;
  date: string; // Local date in 'yyyy-MM-dd' format
}

interface FetchSalesParams {
  organizationId: string;
  date: string; // Local date in 'yyyy-MM-dd' format
  paid?: boolean;
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

    // Fetch employee name
    const userDoc = await getDoc(doc(db, 'users', saleData.employeeId));
    const userData = userDoc.exists() ? userDoc.data() : null;
    const employeeName = userData
      ? `${userData.firstName} ${userData.lastName}`
      : 'Unknown';

    // Add `paid` field defaulting to false
    // Add sale with employee name
    const saleToAdd = {
      ...saleData,
      employeeName,
      paid: false, // Always default `paid` to false
    };

    // Add to Firestore
    await addDoc(salesCollection, saleToAdd);

    console.log('Sale added successfully:', saleToAdd);
  } catch (error) {
    console.error('Error adding sale:', error);
    throw new Error('Failed to add sale');
  }
};

export const fetchOrganizationSalesOfEmployee = async ({
  organizationId,
  employeeId,
  date,
}: FetchSalesParamsEmployee): Promise<SaleData[]> => {
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

// Fetch sales for an organization by date and payment status
export const fetchOrganizationSales = async ({
  organizationId,
  date,
  paid,
}: FetchSalesParams): Promise<SaleData[]> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Parse the date as a local date
  const parsedDate = parse(date, 'yyyy-MM-dd', new Date()); // Parse as local date
  const localStartOfDay = startOfDay(parsedDate); // Start of day in local time
  const localEndOfDay = endOfDay(parsedDate); // End of day in local time

  // Convert local times to UTC
  const utcStartOfDay = toZonedTime(localStartOfDay, timeZone);
  const utcEndOfDay = toZonedTime(localEndOfDay, timeZone);

  const salesCollection = collection(db, 'sales');
  const queryConditions = [
    where('organizationId', '==', organizationId),
    where('createdAt', '>=', utcStartOfDay.toISOString()),
    where('createdAt', '<=', utcEndOfDay.toISOString()),
  ];

  // Include the "paid" filter conditionally if it exists
  if (paid !== undefined) {
    queryConditions.push(where('paid', '==', paid));
  }

  const salesQuery = query(salesCollection, ...queryConditions);

  const querySnapshot = await getDocs(salesQuery);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as SaleData; // Extract document data
    return { ...data, id: doc.id }; // Add the document ID explicitly
  });
};

// Update a sale document
export const updateSale = async (
  saleId: string,
  updates: Partial<Pick<SaleData, 'amount' | 'comboNum' | 'note' | 'paid'>>
): Promise<void> => {
  const saleRef = doc(db, 'sales', saleId);

  try {
    await updateDoc(saleRef, updates);
    console.log(`Sale ${saleId} updated successfully.`);
  } catch (error) {
    console.error(`Failed to update sale ${saleId}:`, error);
    throw new Error('Failed to update sale. Please try again.');
  }
};
