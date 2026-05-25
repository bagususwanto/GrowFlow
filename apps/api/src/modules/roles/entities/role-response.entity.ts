import { ApiProperty } from '@nestjs/swagger';
import { RoleResponse } from '@growflow/types';

export class RoleResponseEntity implements RoleResponse {
  @ApiProperty({ description: 'The unique ID of the role', example: 'role-uuid' })
  id!: string;

  @ApiProperty({ description: 'The name of the role', example: 'superadmin' })
  name!: string;

  @ApiProperty({ description: 'List of permissions assigned to the role', type: [String] })
  permissions!: any[];

  @ApiProperty({ description: 'Creation date of the role' })
  createdAt!: string;

  @ApiProperty({ description: 'Last update date of the role' })
  updatedAt!: string;
}
