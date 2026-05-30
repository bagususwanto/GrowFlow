import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePurchaseOrderRequest } from '@growflow/types';
import { CreatePurchaseOrderLineItemDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto implements UpdatePurchaseOrderRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orderDate?: string;

  @ApiPropertyOptional({ type: [CreatePurchaseOrderLineItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderLineItemDto)
  lineItems?: CreatePurchaseOrderLineItemDto[];
}
