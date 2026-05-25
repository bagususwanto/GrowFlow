import { ApiProperty } from '@nestjs/swagger';
import { RoleEntity } from './role.entity';

export class UserEntity {
  @ApiProperty({ description: 'The unique ID of the user', example: 'user-uuid' })
  id!: string;

  @ApiProperty({ description: 'The name of the user', example: 'Super Admin' })
  name!: string;

  @ApiProperty({ description: 'The email address of the user', example: 'admin@growflow.com' })
  email!: string;

  @ApiProperty({ description: 'Hashed password string' })
  passwordHash!: string;

  @ApiProperty({ description: 'Role ID assigned to the user', example: 'role-uuid' })
  roleId!: string;

  @ApiProperty({ description: 'Assigned Role entity details', type: () => RoleEntity })
  role!: RoleEntity;

  @ApiProperty({ description: 'Status of the user account', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Creation date of the user' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date of the user' })
  updatedAt!: Date;
}
