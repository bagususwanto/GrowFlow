import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StockAdjustmentRequest } from '@growflow/types';

export class StockAdjustmentDto implements StockAdjustmentRequest {
  @ApiProperty({ description: 'ID of the item' })
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ description: 'ID of the warehouse' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ description: 'Quantity to adjust (positive for addition, negative for reduction)' })
  @IsNumber()
  @IsNotEmpty()
  qty!: number;

  @ApiPropertyOptional({ description: 'Adjustment note' })
  @IsString()
  @IsOptional()
  note?: string;
}
