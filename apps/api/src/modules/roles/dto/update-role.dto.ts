import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { UpdateRoleRequest } from '@growflow/types';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) implements UpdateRoleRequest {
  @ApiPropertyOptional({ description: 'Status aktif role' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
