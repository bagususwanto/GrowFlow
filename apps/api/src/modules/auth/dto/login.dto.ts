import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest } from '@growflow/types';

export class LoginDto implements LoginRequest {
  @ApiProperty({ example: 'admin@growflow.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(8)
  password!: string;
}
