import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UpdatePasswordRequest } from '@growflow/types';

export class UpdatePasswordDto implements UpdatePasswordRequest {
  @ApiProperty({ example: 'OldPassword123!', required: true })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword123!', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
