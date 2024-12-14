import { db } from '@shared/services/firebase';
import { UserType } from '@shared/types/user';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// Check if a user exists by email
export const getUserByEmail = async (
  email: string
): Promise<Pick<UserType, 'id' | 'email'> | null> => {
  const usersCollection = collection(db, 'users');
  const userQuery = query(usersCollection, where('email', '==', email));
  const snapshot = await getDocs(userQuery);

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    return {
      id: userDoc.id,
      email: userData.email,
    };
  }

  return null; // No user found
};

// Assign an owner to an organization
export const assignOrganizationOwner = async (
  orgId: string,
  email: string
): Promise<'success' | 'user-not-found'> => {
  // Check if the user exists
  const user = await getUserByEmail(email);
  if (!user) {
    return 'user-not-found'; // Return a status instead of throwing an error
  }

  // Update the organization document
  const orgDocRef = doc(db, 'organizations', orgId);
  await updateDoc(orgDocRef, {
    owner: {
      email: user.email,
      uid: user.id,
    },
  });

  return 'success';
};
