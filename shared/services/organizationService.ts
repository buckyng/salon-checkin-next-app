import { FirestoreCollections } from '@shared/constants/firestoreCollections';
import { db } from '@shared/services/firebase';
import {
  Organization,
  OrganizationUser,
  UserRole,
} from '@shared/types/organization';
import { UserType } from '@shared/types/user';
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
  const usersCollection = collection(db, FirestoreCollections.Users);
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
  const orgDocRef = doc(db, FirestoreCollections.Organizations, orgId);
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
    const orgUsersCollection = collection(
      db,
      FirestoreCollections.OrganizationUsers
    );
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
          const orgDocRef = doc(db, FirestoreCollections.Organizations, orgId);
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
export const fetchUserRoles = async (
  userId: string,
  organizationId: string
): Promise<UserRole[]> => {
  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );
  const userRolesQuery = query(
    orgUsersCollection,
    where('userId', '==', userId),
    where('organizationId', '==', organizationId)
  );
  const snapshot = await getDocs(userRolesQuery);

  return snapshot.docs.map((doc) => ({
    organizationId: doc.data().organizationId,
    roles: doc.data().roles || [],
  }));
};

export const validateOwnerRole = async (
  user: { uid: string },
  organizationId: string
): Promise<boolean> => {
  if (!organizationId) {
    throw new Error('Organization ID is required to validate roles.');
  }

  const roles = await fetchUserRoles(user.uid, organizationId);
  return roles.some((role) => role.roles.includes('owner'));
};

// Assign "Owner" role to a user for an organization
export const assignOwnerRole = async (
  organizationId: string,
  userId: string,
  email: string
): Promise<void> => {
  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );

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
  const orgDocRef = doc(db, FirestoreCollections.Organizations, organizationId);
  await updateDoc(orgDocRef, {
    owner: { email, uid: userId },
  });
};

export const removeOwnerRole = async (
  organizationId: string,
  userId: string
) => {
  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );

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
  const updatedRoles = existingData.roles.filter(
    (role: string) => role !== 'owner'
  );

  if (updatedRoles.length > 0) {
    // If the user still has other roles, update the document
    await updateDoc(ownerDocRef, { roles: updatedRoles });
  } else {
    // If no roles are left, delete the document
    await deleteDoc(ownerDocRef);
  }

  // Update the organization document to remove the owner field
  const orgDocRef = doc(db, FirestoreCollections.Organizations, organizationId);
  await updateDoc(orgDocRef, {
    owner: null,
  });
};

// Validate if the user has any roles in organizations
export const validateClientRole = async (
  user: {
    uid: string;
  },
  organizationId: string
): Promise<boolean> => {
  try {
    // Reference the OrganizationUsers collection
    const orgUsersCollection = collection(
      db,
      FirestoreCollections.OrganizationUsers
    );

    // Query for roles matching the userId and organizationId
    const orgUsersQuery = query(
      orgUsersCollection,
      where('userId', '==', user.uid),
      where('organizationId', '==', organizationId)
    );

    const snapshot = await getDocs(orgUsersQuery);

    // Check if the user has any roles within the specified organization
    return !snapshot.empty;
  } catch (error) {
    console.error('Error validating client roles:', error);
    throw new Error('Failed to validate client roles. Please try again.');
  }
};

// Fetch users in an organization
export const fetchUsersByOrganization = async (
  organizationId: string,
  ownerId: string
): Promise<any[]> => {
  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );
  const orgUsersQuery = query(
    orgUsersCollection,
    where('organizationId', '==', organizationId)
  );

  const orgUserSnapshots = await getDocs(orgUsersQuery);

  // Exclude owner and collect user IDs
  const userIds = orgUserSnapshots.docs
    .map((doc) => doc.data().userId)
    .filter((userId) => userId !== ownerId);

  if (userIds.length === 0) {
    // No users to fetch, return an empty array
    return [];
  }

  // Batch fetch user details
  const usersCollection = collection(db, FirestoreCollections.Users);
  const userDetailsQuery = query(
    usersCollection,
    where('__name__', 'in', userIds)
  );
  const userSnapshots = await getDocs(userDetailsQuery);

  const userDetails = userSnapshots.docs.map((userDoc) => ({
    userId: userDoc.id,
    name:
      userDoc.data().firstName + ' ' + userDoc.data().lastName ||
      'Unknown Name',
    email: userDoc.data().email || 'Unknown Email',
  }));

  // Merge roles from OrganizationUsers
  return orgUserSnapshots.docs
    .map((orgUserDoc) => {
      const orgUserData = orgUserDoc.data();
      const userDetail = userDetails.find(
        (user) => user.userId === orgUserData.userId
      );

      if (!userDetail) return null;

      return {
        userId: orgUserData.userId,
        name: userDetail.name,
        email: userDetail.email,
        roles: orgUserData.roles || [],
        createdAt: orgUserData.createdAt?.toDate() || new Date(),
      };
    })
    .filter((user) => user !== null);
};

// Add a user to an organization
export const addUserToOrganization = async (
  organizationId: string,
  email: string
): Promise<void> => {
  const usersCollection = collection(db, FirestoreCollections.Users);
  const userQuery = query(usersCollection, where('email', '==', email));
  const snapshot = await getDocs(userQuery);

  if (snapshot.empty) {
    throw new Error('User with this email does not exist.');
  }

  const userDoc = snapshot.docs[0];
  const userId = userDoc.id;

  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );
  const orgUserDocRef = doc(orgUsersCollection);

  await setDoc(orgUserDocRef, {
    userId,
    organizationId,
    roles: ['employee'], // Default role
    createdAt: new Date(),
  });
};

// Update roles for a user in an organization
export const updateUserRoles = async (
  organizationId: string,
  userId: string,
  roles: string[]
): Promise<void> => {
  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );
  const orgUsersQuery = query(
    orgUsersCollection,
    where('userId', '==', userId),
    where('organizationId', '==', organizationId)
  );
  const snapshot = await getDocs(orgUsersQuery);

  if (snapshot.empty) {
    throw new Error('User is not part of this organization.');
  }

  const docRef = doc(orgUsersCollection, snapshot.docs[0].id);
  await updateDoc(docRef, { roles });
};

// Remove a user from an organization
export const removeUserFromOrganization = async (
  organizationId: string,
  userId: string
): Promise<void> => {
  const orgUsersCollection = collection(
    db,
    FirestoreCollections.OrganizationUsers
  );
  const orgUsersQuery = query(
    orgUsersCollection,
    where('userId', '==', userId),
    where('organizationId', '==', organizationId)
  );
  const snapshot = await getDocs(orgUsersQuery);

  if (snapshot.empty) {
    throw new Error('User is not part of this organization.');
  }

  const docRef = doc(orgUsersCollection, snapshot.docs[0].id);
  await deleteDoc(docRef);
};

// Fetch sales data for an organization
export const fetchSalesByOrganization = async (
  organizationId: string
): Promise<any[]> => {
  const salesCollection = collection(db, 'sales');
  const salesQuery = query(
    salesCollection,
    where('organizationId', '==', organizationId)
  );
  const snapshot = await getDocs(salesQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    employeeId: doc.data().employeeId,
    saleAmount: doc.data().saleAmount,
    saleDate: doc.data().saleDate?.toDate() || new Date(),
  }));
};

// Fetch organization details by ID
export const fetchOrganizationById = async (
  organizationId: string
): Promise<Organization | null> => {
  try {
    const orgDocRef = doc(db, 'organizations', organizationId);
    const orgDoc = await getDoc(orgDocRef);

    if (orgDoc.exists()) {
      let data = orgDoc.data();
      return {
        id: orgDoc.id,
        name: data.name || 'Unnamed Organization',
        createdAt: data.createdAt.toDate() || new Date(), // Handle Firestore timestamp
        owner: {
          uid: data.owner?.uid || 'unknown',
          email: data.owner?.email || 'unknown@domain.com',
        },
      };
    } else {
      console.warn(`Organization with ID ${organizationId} not found.`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw new Error('Failed to fetch organization details.');
  }
};

export const fetchUserRolesByOrganization = async (
  userId: string,
  organizationId: string
): Promise<UserRole[]> => {
  try {
    const orgUsersCollection = collection(db, 'OrganizationUsers');
    const rolesQuery = query(
      orgUsersCollection,
      where('userId', '==', userId),
      where('organizationId', '==', organizationId)
    );

    const snapshot = await getDocs(rolesQuery);

    if (snapshot.empty) {
      return []; // Return an empty array if no roles are found
    }

    return snapshot.docs.map((doc) => doc.data() as UserRole);
  } catch (error) {
    console.error('Error fetching user roles by organization:', error);
    return []; // Fallback to an empty array on error
  }
};

// Fetch all organizations from Firestore
export const fetchOrganizations = async (): Promise<Organization[]> => {
  try {
    const organizationsCollection = collection(db, 'organizations'); // Adjust collection name if different
    const querySnapshot = await getDocs(organizationsCollection);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Firestore document ID
        name: data.name, // Organization name field in Firestore
        createdAt: data.createdAt?.toDate() || new Date(), // Handle Firestore timestamp
        owner: {
          uid: data.owner?.uid || 'unknown',
          email: data.owner?.email || 'unknown@domain.com',
        },
      };
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw new Error('Failed to fetch organizations.');
  }
};
