import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; // Return the authenticated user
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.clear(); // Clear all user-related data from localStorage
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign-out Error:', error);
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Update user profile with additional details
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`,
  });

  // Save user data to Firestore
  await setDoc(doc(db, 'users', user.uid), {
    firstName,
    lastName,
    email,
    photoUrl: user.photoURL || null,
    createdAt: serverTimestamp(), // Add a timestamp for when the user was created
  });

  return user;
};

export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};
