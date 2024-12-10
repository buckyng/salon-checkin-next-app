import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { AdminEmail } from '@shared/types/firebase';
import { db } from '@shared/services/firebase'; // Import shared Firebase instance

/**
 * Fetches all admin emails from the Firebase Firestore.
 * @returns Promise<string[]> - A list of admin emails.
 */
export const fetchAdminEmails = async (): Promise<string[]> => {
  const adminEmails: string[] = [];
  const querySnapshot = await getDocs(collection(db, 'adminEmails'));
  querySnapshot.forEach((doc) => {
    const data = doc.data() as AdminEmail;
    adminEmails.push(data.email);
  });
  return adminEmails;
};
