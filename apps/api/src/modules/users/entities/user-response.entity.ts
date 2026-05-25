import { ApiProperty } from '@nestjs/swagger';
import { UserResponse, RoleName } from '@growflow/types';

class RoleResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'superadmin' })
  name!: RoleName;
}

export class UserResponseEntity implements UserResponse {
  @ApiProperty({ description: 'The unique ID of the user', example: 'user-uuid' })
  id!: string;

  @ApiProperty({ description: 'The name of the user', example: 'Super Admin' })
  name!: string;

  @ApiProperty({ description: 'The email address of the user', example: 'admin@growflow.com' })
  email!: string;

  @ApiProperty({ description: 'Role ID assigned to the user', example: 'role-uuid' })
  roleId!: string;

  @ApiProperty({ description: 'Assigned Role details', type: () => RoleResponse })
  role!: RoleResponse;

  @ApiProperty({ description: 'Status of the user account', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Creation date of the user' })
  createdAt!: string;

  @ApiProperty({ description: 'Last update date of the user' })
  updatedAt!: string;
}
