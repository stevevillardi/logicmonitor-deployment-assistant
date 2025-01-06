export type UserRole = 'admin' | 'lm_user' | 'viewer';

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'challenges' | 'pov' | 'criteria' | 'users';
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'create', resource: 'pov' },
    { action: 'read', resource: 'pov' },
    { action: 'update', resource: 'pov' },
    { action: 'delete', resource: 'pov' },
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users' },
    // Add other admin permissions
],
lm_user: [
    { action: 'read', resource: 'pov' },
    { action: 'update', resource: 'pov' },
    { action: 'create', resource: 'pov' },
    // Add other editor permissions
  ],
  viewer: [
    // Default permissions
  ],
}; 