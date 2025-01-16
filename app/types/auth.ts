export type UserRole = 'admin' | 'lm_user' | 'viewer';

export type Permission = {
  action: 'view' | 'manage' | 'create' | 'delete';
  resource: 'users' | 'video' | 'pov' | 'team' | 'working_sessions' | 'device_scope' | 'challenges' | 'decision_criteria' | 'documents' | 'pov_details' | 'key_business_services';
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'video' },

    { action: 'manage', resource: 'pov' },
    { action: 'manage', resource: 'team' },
    { action: 'manage', resource: 'working_sessions' },
    { action: 'manage', resource: 'device_scope' },
    { action: 'manage', resource: 'documents' },
    { action: 'manage', resource: 'pov_details' },
    { action: 'manage', resource: 'challenges' },
    { action: 'manage', resource: 'decision_criteria' },
    { action: 'manage', resource: 'key_business_services' },
    { action: 'manage', resource: 'pov_details' },

  ],
  lm_user: [
    { action: 'manage', resource: 'pov' },
    { action: 'manage', resource: 'team' },
    { action: 'manage', resource: 'working_sessions' },
    { action: 'manage', resource: 'device_scope' },
    { action: 'manage', resource: 'documents' },
    { action: 'manage', resource: 'pov_details' },
    { action: 'manage', resource: 'challenges' },
    { action: 'manage', resource: 'decision_criteria' },
    { action: 'manage', resource: 'key_business_services' },
    { action: 'manage', resource: 'pov_details' },
  ],
  viewer: [
    // { action: 'view', resource: 'pov' },
    { action: 'view', resource: 'team' },
    { action: 'view', resource: 'working_sessions' },
    { action: 'view', resource: 'device_scope' },
    { action: 'view', resource: 'documents' },
    { action: 'view', resource: 'pov_details' },
    { action: 'view', resource: 'challenges' },
    { action: 'view', resource: 'decision_criteria' },
    { action: 'view', resource: 'key_business_services' },
    { action: 'view', resource: 'pov_details' },
  ]
}; 