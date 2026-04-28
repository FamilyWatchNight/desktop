/**
 * Serializable payload for AuthContext (used in transport layers like IPC, HTTP, test hooks)
 */
export interface AuthContextPayload {
  userId: number;
  permissions: string[];
}

/**
 * Auth context for authorization checks
 */
export interface AuthContext extends AuthContextPayload {
  /**
   * Check if the auth context has a specific permission
   */
  hasPermission(permission: string): boolean;
}

/**
 * Create an AuthContext with permission checking methods
 */
export function createAuthContext(userId: number, permissions: string[]): AuthContext {
  return {
    userId,
    permissions,
    hasPermission: (permission: string) => permissions.includes('can-admin') || permissions.includes(permission)
  };
}

/**
 * Create an AuthContext to represent system-initiated actions
 */
export function createSystemContext(): AuthContext {
  return createAuthContext(-1, ['can-admin']);
}



