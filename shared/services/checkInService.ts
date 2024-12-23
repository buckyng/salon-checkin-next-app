import { FirestoreCollections } from '@shared/constants/firestoreCollections';
import { db } from '@shared/services/firebase';
import { Client } from '@shared/types/client';
import { CheckInData } from '@shared/types/transaction';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

// Define types for saveCheckIn parameters
interface SaveCheckInParams {
  organizationId: string;
  clientId: string;
}

interface SaveClientParams {
  organizationId: string;
  clientId?: string; // Optional for new clients
  clientData: Client;
}

const getClientsCollection = (organizationId: string) => {
  return collection(
    doc(db, FirestoreCollections.Organizations, organizationId),
    FirestoreCollections.Clients
  );
};

const getCheckInsCollection = (organizationId: string) => {
  return collection(
    doc(db, FirestoreCollections.Organizations, organizationId),
    FirestoreCollections.CheckIns
  );
};

/**
 * Fetch a client by ID from the Clients collection of a specific organization.
 * @param organizationId - The ID of the organization.
 * @param clientId - The ID of the client to fetch.
 * @returns The client data.
 * @throws If the client does not exist.
 */
export const fetchClientById = async (
  organizationId: string,
  clientId: string
): Promise<Client> => {
  try {
    const clientRef = doc(
      db,
      FirestoreCollections.Organizations,
      organizationId,
      FirestoreCollections.Clients,
      clientId
    );
    const clientSnapshot = await getDoc(clientRef);

    if (!clientSnapshot.exists()) {
      throw new Error(`Client with ID ${clientId} not found`);
    }

    return clientSnapshot.data() as Client;
  } catch (error) {
    console.error('Error querying client by Id:', error);
    throw error; // Ensure the error is propagated back to the caller
  }
};

// Query a client by phone number
export const queryClientByPhone = async (
  organizationId: string,
  phone: string
): Promise<Client | null> => {
  try {
    const clientsCollection = getClientsCollection(organizationId);
    const clientQuery = query(clientsCollection, where('phone', '==', phone));
    const snapshot = await getDocs(clientQuery);

    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data() as Client;
      return { id: snapshot.docs[0].id, ...docData };
    }

    return null; // No client found
  } catch (error) {
    console.error('Error querying client by phone:', error);
    throw error; // Ensure the error is propagated back to the caller
  }
};

export const saveClient = async ({
  organizationId,
  clientId,
  clientData,
}: SaveClientParams): Promise<string> => {
  try {
    const clientsCollection = getClientsCollection(organizationId);

    if (clientId) {
      // Update existing client
      const clientRef = doc(clientsCollection, clientId);
      const existingClient = await getDoc(clientRef);

      const numberOfVisits = existingClient.exists()
        ? (existingClient.data()?.numberOfVisits || 0) + 1
        : 1;

      await setDoc(
        clientRef,
        {
          ...clientData,
          numberOfVisits,
        },
        { merge: true }
      );

      return clientId;
    } else {
      // Add new client
      const newClientDoc = await addDoc(clientsCollection, {
        ...clientData,
        numberOfVisits: 1, // First visit
        createdAt: serverTimestamp(),
      });

      return newClientDoc.id;
    }
  } catch (error) {
    console.error('Error saving client:', error);
    throw error; // Ensure promise is rejected properly
  }
};

// Save a check-in record
export const saveCheckIn = async ({
  organizationId,
  clientId,
}: SaveCheckInParams): Promise<void> => {
  try {
    const checkInsCollection = getCheckInsCollection(organizationId);
    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0]; // Format as YYYY-MM-DD helper for daily query

    //fetch the client data using clientId
    const { firstName, lastName } = await fetchClientById(
      organizationId,
      clientId
    );

    const clientName = `${firstName} ${lastName}`.trim();

    await addDoc(checkInsCollection, {
      clientId,
      clientName,
      checkInTime: now, // Full timestamp
      date: dateOnly, // Only the date
      isInService: false,
    });
  } catch (error) {
    console.error('Error saving client:', error);
    throw error; // Ensure promise is rejected properly
  }
};

export const fetchCheckInsToday = async (organizationId: string) => {
  const checkInsCollection = getCheckInsCollection(organizationId);
  // Get the current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const q = query(
    checkInsCollection,
    where('date', '==', today),
    orderBy('checkInTime', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as CheckInData),
  }));
};

/**
 * Updates the isInService value of a specific check-in record.
 *
 * @param organizationId - The ID of the organization.
 * @param checkInId - The ID of the check-in document to update.
 * @param isInService - The new value for isInService.
 */
export const updateCheckInServiceStatus = async (
  organizationId: string,
  checkInId: string,
  isInService: boolean
): Promise<void> => {
  try {
    const checkInRef = doc(
      db,
      FirestoreCollections.Organizations,
      organizationId,
      'checkIns',
      checkInId
    );

    await updateDoc(checkInRef, { isInService });
  } catch (error) {
    console.error('Error updating isInService:', error);
    throw error;
  }
};
