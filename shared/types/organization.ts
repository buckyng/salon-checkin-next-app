export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
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
