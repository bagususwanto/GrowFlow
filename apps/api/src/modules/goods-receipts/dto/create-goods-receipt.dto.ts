import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGoodsReceiptRequest, CreateGoodsReceiptLineItemRequest } from '@growflow/types';

export class CreateGoodsReceiptLineItemDto implements CreateGoodsReceiptLineItemRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  poLineItemId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  qty!: number;
}

export class CreateGoodsReceiptDto implements CreateGoodsReceiptRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purchaseOrderId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receivedDate?: string;

  @ApiProperty({ type: [CreateGoodsReceiptLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptLineItemDto)
  lineItems!: CreateGoodsReceiptLineItemDto[];
}
