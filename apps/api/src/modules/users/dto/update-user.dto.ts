import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateUserRequest } from '@growflow/types';

export class UpdateUserDto extends PartialType(CreateUserDto) implements UpdateUserRequest {
  @ApiProperty({ example: true, description: 'Is user active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
