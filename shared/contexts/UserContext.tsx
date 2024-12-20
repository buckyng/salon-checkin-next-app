import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@shared/services/firebase';

interface Organization {
  id: string;
  name: string;
}

interface UserContextProps {
  user: User | null;
  loading: boolean;
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        selectedOrganization,
        setSelectedOrganization,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  if (typeof window === 'undefined') {
    // Return a default value or throw an error for server-side use
    return { user: null, loading: true };
  }
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};
