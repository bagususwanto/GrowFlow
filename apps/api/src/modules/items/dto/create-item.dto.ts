import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateItemRequest } from '@growflow/types';

export class CreateItemDto implements CreateItemRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minStock?: number;
}
