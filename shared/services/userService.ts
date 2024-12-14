import { db } from '@shared/services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const fetchUserByEmail = async (
  email: string
): Promise<{ uid: string; email: string } | null> => {
  const usersCollection = collection(db, 'users');
  const userQuery = query(usersCollection, where('email', '==', email));
  const snapshot = await getDocs(userQuery);

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    return {
      uid: userDoc.id,
      email: userData.email,
    };
  }

  return null;
};
