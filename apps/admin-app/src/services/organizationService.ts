import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Organization } from '@shared/types/organization';
import { db } from '@shared/services/firebase';

const COLLECTION_NAME = 'organizations';
const orgCollection = collection(db, COLLECTION_NAME);
// Fetch all organizations
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const snapshot = await getDocs(orgCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Organization, 'id'>),
  }));
};

// Add a new organization
export const addOrganization = async (name: string): Promise<void> => {
  await addDoc(orgCollection, {
    name,
    createdAt: serverTimestamp(),
  });
};

// Update an organization
export const updateOrganization = async (
  id: string,
  name: string
): Promise<void> => {
  const orgDoc = doc(db, COLLECTION_NAME, id);
  await updateDoc(orgDoc, { name });
};

// Delete an organization
export const deleteOrganization = async (id: string): Promise<void> => {
  const orgDoc = doc(db, COLLECTION_NAME, id);
  await deleteDoc(orgDoc);
};
