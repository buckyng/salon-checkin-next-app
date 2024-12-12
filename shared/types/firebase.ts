import type { User as FirebaseUser } from 'firebase/auth';

export interface AdminEmail {
  email: string;
}

export type User = FirebaseUser & {
  displayName?: string;
  photoURL?: string;
};
