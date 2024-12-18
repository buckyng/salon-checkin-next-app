const allRoles = ['employee', 'manager', 'owner', 'cashier'];

export const sidebarAccess: Record<string, string[]> = {
  dashboard: allRoles, // Accessible to all roles
  organizations: ['owner'], // Only owners can see this
  reports: ['owner', 'manager'], // Owners and managers can see this
  settings: allRoles, // All roles can access settings
};
