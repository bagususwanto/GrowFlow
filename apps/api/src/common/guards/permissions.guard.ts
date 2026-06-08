import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.permissions) {
      return false;
    }

    const userPermissions = user.permissions as string[];

    // Check if the user satisfies all required permissions
    return requiredPermissions.every((required) => 
      userPermissions.some((userPerm) => this.matchPermission(userPerm, required))
    );
  }

  private matchPermission(userPerm: string, required: string): boolean {
    if (userPerm === '*') return true;
    if (userPerm === required) return true;

    const [userAction, userResource] = userPerm.split(':');
    const [reqAction, reqResource] = required.split(':');

    if (!userAction || !userResource || !reqAction || !reqResource) {
      return false;
    }

    // e.g. "create:*" matches "create:items"
    if (userAction === reqAction && userResource === '*') {
      return true;
    }

    // e.g. "*:items" matches "create:items"
    if (userAction === '*' && userResource === reqResource) {
      return true;
    }

    // e.g. "write:items" matches "create:items", "update:items", "delete:items", "confirm:items", etc.
    if (userAction === 'write' && userResource === reqResource && reqAction !== 'read') {
      return true;
    }

    return false;
  }
}
