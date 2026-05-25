import { ApiProperty } from '@nestjs/swagger';

export class RoleEntity {
  @ApiProperty({ description: 'The unique ID of the role', example: 'role-uuid' })
  id!: string;

  @ApiProperty({ description: 'The unique name of the role', example: 'superadmin' })
  name!: string;

  @ApiProperty({ description: 'The description of the role', example: 'Super Administrator' })
  description?: string | null;

  @ApiProperty({ description: 'Creation date of the role' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date of the role' })
  updatedAt!: Date;
}
