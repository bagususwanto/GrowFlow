import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePurchaseOrderRequest, CreatePurchaseOrderLineItemRequest } from '@growflow/types';

export class CreatePurchaseOrderLineItemDto implements CreatePurchaseOrderLineItemRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  qty!: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}

export class CreatePurchaseOrderDto implements CreatePurchaseOrderRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orderDate?: string;

  @ApiProperty({ type: [CreatePurchaseOrderLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderLineItemDto)
  lineItems!: CreatePurchaseOrderLineItemDto[];
}
