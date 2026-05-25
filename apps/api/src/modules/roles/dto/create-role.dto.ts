import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateRoleRequest } from '@growflow/types';

export class CreateRoleDto implements CreateRoleRequest {
  @ApiProperty({ example: 'staff', description: 'The unique name of the role' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: ['read:items', 'write:items'], description: 'Permissions assigned to the role', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  permissions?: any[];
}
