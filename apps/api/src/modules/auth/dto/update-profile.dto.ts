import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UpdateProfileRequest } from '@growflow/types';

export class UpdateProfileDto implements UpdateProfileRequest {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;
}
