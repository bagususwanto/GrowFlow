import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { RoleName } from '@growflow/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
