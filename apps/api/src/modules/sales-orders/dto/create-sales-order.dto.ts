import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalesOrderRequest, CreateSalesOrderLineItemRequest } from '@growflow/types';

export class CreateSalesOrderLineItemDto implements CreateSalesOrderLineItemRequest {
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

export class CreateSalesOrderDto implements CreateSalesOrderRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId!: string;

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
  orderDate?: string;

  @ApiProperty({ type: [CreateSalesOrderLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderLineItemDto)
  lineItems!: CreateSalesOrderLineItemDto[];
}
