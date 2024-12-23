export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  logoUrl?: string;
  owner: {
    email: string;
    uid: string;
  };
}

export interface OrganizationWithRoles {
  id: string;
  name: string;
  roles: string[];
}

export interface OrganizationUser {
  userId: string;
  roles: string[];
  createdAt: Date;
}

export interface UserRole {
  organizationId: string;
  roles: string[];
}
