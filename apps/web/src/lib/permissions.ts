/**
 * Check if the user's list of permissions matches the required permission.
 * 
 * Supports wildcard matching:
 * - '*' matches any permission.
 * - 'read:*' matches 'read:items', 'read:warehouses', etc.
 * - Exact match works.
 */
export function hasPermission(userPermissions: string[] | undefined, required: string): boolean {
  if (!userPermissions) return false;
  if (userPermissions.includes('*')) return true;
  if (userPermissions.includes(required)) return true;

  const [requiredAction, requiredResource] = required.split(':');
  if (!requiredAction || !requiredResource) return false;

  return userPermissions.some((permission) => {
    const [action, resource] = permission.split(':');
    
    // Wildcard checks e.g. "read:*" matching "read:items"
    if (action === requiredAction && resource === '*') {
      return true;
    }
    // Global action check e.g. "*:items"
    if (action === '*' && resource === requiredResource) {
      return true;
    }
    // Synonym mapping: 'write' permission satisfies create, update, delete, etc. for the resource (anything but 'read')
    if (action === 'write' && resource === requiredResource && requiredAction !== 'read') {
      return true;
    }
    return false;
  });
}
