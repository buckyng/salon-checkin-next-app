import { db } from '@shared/services/firebase';
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

const organizationsCollection = collection(db, 'organizations');

// Fetch all organizations
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const snapshot = await getDocs(organizationsCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    createdAt: doc.data().createdAt.toDate(),
  }));
};

// Add a new organization
export const addOrganization = async (name: string): Promise<void> => {
  await addDoc(organizationsCollection, {
    name,
    createdAt: serverTimestamp(),
  });
};

// Update an organization
export const updateOrganization = async (
  id: string,
  name: string
): Promise<void> => {
  const orgDoc = doc(db, 'organizations', id);
  await updateDoc(orgDoc, { name });
};

// Delete an organization
export const deleteOrganization = async (id: string): Promise<void> => {
  const orgDoc = doc(db, 'organizations', id);
  await deleteDoc(orgDoc);
};
