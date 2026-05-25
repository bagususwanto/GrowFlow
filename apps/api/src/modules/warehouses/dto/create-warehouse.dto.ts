import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateWarehouseRequest } from '@growflow/types';

export class CreateWarehouseDto implements CreateWarehouseRequest {
  @ApiProperty({ description: 'The name of the warehouse' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'The address of the warehouse' })
  @IsString()
  @IsOptional()
  address?: string;
}
