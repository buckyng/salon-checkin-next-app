import { db } from '@shared/services/firebase';
import { UserRole, UserType } from '@shared/types/user';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
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

interface OrganizationWithRoles {
  id: string;
  name: string;
  roles: string[];
}

// Fetch organizations accessible by a specific user with roles
export const fetchOrganizationsByUser = async (
  userId: string
): Promise<OrganizationWithRoles[]> => {
  try {
    const orgUsersCollection = collection(db, 'OrganizationUsers');
    const orgUsersQuery = query(
      orgUsersCollection,
      where('userId', '==', userId)
    );
    const orgUserSnapshots = await getDocs(orgUsersQuery);

    if (orgUserSnapshots.empty) {
      return []; // Return an empty array if the user is not part of any organization
    }

    const organizations = await Promise.all(
      orgUserSnapshots.docs.map(async (orgUserDoc) => {
        const data = orgUserDoc.data();
        const orgId = data.organizationId;

        try {
          // Fetch organization details
          const orgDocRef = doc(db, 'organizations', orgId);
          const orgDoc = await getDoc(orgDocRef);

          if (orgDoc.exists()) {
            return {
              id: orgId,
              name: orgDoc.data()?.name || 'Unknown Organization',
              roles: data.roles || [], // Include roles in the response
            };
          } else {
            console.warn(`Organization document ${orgId} does not exist.`);
            return null;
          }
        } catch (error) {
          console.error(`Error fetching organization ${orgId}:`, error);
          return null;
        }
      })
    );

    // Filter out any null organizations
    return organizations.filter(
      (org): org is OrganizationWithRoles => org !== null
    );
  } catch (error) {
    console.error('Error fetching organizations by user:', error);
    throw new Error('Failed to fetch organizations. Please try again.');
  }
};

// Fetch all roles for a specific user across organizations
export const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
  const orgUsersCollection = collection(db, 'OrganizationUsers');
  const userRolesQuery = query(
    orgUsersCollection,
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(userRolesQuery);

  return snapshot.docs.map((doc) => ({
    organizationId: doc.data().organizationId,
    roles: doc.data().roles || [],
  }));
};

export const validateOwnerRole = async (user: {
  uid: string;
}): Promise<boolean> => {
  const roles = await fetchUserRoles(user.uid);
  return roles.some((role) => role.roles.includes('owner'));
};

// Assign "Owner" role to a user for an organization
export const assignOwnerRole = async (
  organizationId: string,
  userId: string,
  email: string
): Promise<void> => {
  const orgUsersCollection = collection(db, 'OrganizationUsers');

  // Query to check if the user already exists in the organization
  const existingUserQuery = query(
    orgUsersCollection,
    where('userId', '==', userId),
    where('organizationId', '==', organizationId)
  );
  const existingSnapshot = await getDocs(existingUserQuery);

  if (!existingSnapshot.empty) {
    const existingDoc = existingSnapshot.docs[0];
    const existingData = existingDoc.data();

    // Add "Owner" to the existing roles if not already present
    const updatedRoles = Array.from(new Set([...existingData.roles, 'owner']));
    const userDocRef = doc(orgUsersCollection, existingDoc.id);
    await updateDoc(userDocRef, { roles: updatedRoles });
  } else {
    // Create a new document if the user is not already in the organization
    const userDocRef = doc(orgUsersCollection);
    await setDoc(userDocRef, {
      userId,
      organizationId,
      roles: ['owner'],
      createdAt: new Date(),
    });
  }

  // Update the organization document to include the new owner's details
  const orgDocRef = doc(db, 'organizations', organizationId);
  await updateDoc(orgDocRef, {
    owner: { email, uid: userId },
  });
};

export const removeOwnerRole = async (
  organizationId: string,
  userId: string
) => {
  const orgUsersCollection = collection(db, 'OrganizationUsers');

  // Query to find the user with the "Owner" role for the organization
  const existingOwnerQuery = query(
    orgUsersCollection,
    where('userId', '==', userId),
    where('organizationId', '==', organizationId)
  );
  const existingSnapshot = await getDocs(existingOwnerQuery);

  if (existingSnapshot.empty) {
    throw new Error('No user found with roles for this organization.');
  }

  // Get the existing document and roles
  const ownerDocId = existingSnapshot.docs[0].id;
  const ownerDocRef = doc(orgUsersCollection, ownerDocId);
  const existingData = existingSnapshot.docs[0].data();

  // Check if the user has the "Owner" role
  if (!existingData.roles.includes('owner')) {
    throw new Error('User does not have the "Owner" role.');
  }

  // Update the roles to remove the "Owner" role
  const updatedRoles = existingData.roles.filter((role) => role !== 'owner');

  if (updatedRoles.length > 0) {
    // If the user still has other roles, update the document
    await updateDoc(ownerDocRef, { roles: updatedRoles });
  } else {
    // If no roles are left, delete the document
    await deleteDoc(ownerDocRef);
  }

  // Update the organization document to remove the owner field
  const orgDocRef = doc(db, 'organizations', organizationId);
  await updateDoc(orgDocRef, {
    owner: null,
  });
};
