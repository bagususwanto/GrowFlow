import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'The refresh token string' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
