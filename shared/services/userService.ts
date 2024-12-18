import { auth, db, storage } from '@shared/services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadFile } from './storageService';
import { updateProfile } from 'firebase/auth';
import { FirestoreCollections } from '@shared/constants/firestoreCollections';
import { UserType } from '@shared/types/user';

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

/**
 * Update the user's profile with first name, last name, and optional profile photo.
 */
export const updateUserProfile = async ({
  firstName,
  lastName,
  profilePhoto,
}: {
  firstName: string;
  lastName: string;
  profilePhoto?: File; // Optional file for profile photo
}): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User is not logged in.');
  }

  const updates: { displayName?: string; photoURL?: string } = {};
  const firestoreUpdates: { displayName?: string; photoURL?: string } = {};

  if (firstName || lastName) {
    const displayName = `${firstName} ${lastName}`;
    updates.displayName = displayName;
    firestoreUpdates.displayName = displayName;
  }

  if (profilePhoto) {
    const photoPath = `profilePhotos/${auth.currentUser.uid}`;
    const photoURL = await uploadFile(photoPath, profilePhoto); // Upload file to Firebase Storage
    updates.photoURL = photoURL;
    firestoreUpdates.photoURL = photoURL;
  }

  // Update Firebase Authentication profile
  await updateProfile(auth.currentUser, updates);

  // Update Firestore `Users` collection
  const userDocRef = doc(db, FirestoreCollections.Users, auth.currentUser.uid);
  await updateDoc(userDocRef, firestoreUpdates);

  console.log('User profile updated successfully.');
};

/**
 * Fetch user profile data from Firestore.
 */
export const fetchUserProfile = async (userId: string): Promise<UserType> => {
  try {
    const userDocRef = doc(db, FirestoreCollections.Users, userId);
    const snapshot = await getDoc(userDocRef);

    if (snapshot.exists()) {
      return snapshot.data() as UserType;
    } else {
      console.info('No user data found in Firestore.');
      return {} as UserType;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile.');
  }
};
