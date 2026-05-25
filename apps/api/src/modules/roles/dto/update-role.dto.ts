import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { UpdateRoleRequest } from '@growflow/types';

export class UpdateRoleDto extends PartialType(CreateRoleDto) implements UpdateRoleRequest {}
