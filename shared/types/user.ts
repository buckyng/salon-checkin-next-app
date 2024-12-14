export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  photoUrl?: string;
}

export interface UserRole {
  organizationId: string;
  roles: string[];
}