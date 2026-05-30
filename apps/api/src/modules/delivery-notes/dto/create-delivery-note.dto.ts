import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDeliveryNoteRequest, CreateDeliveryNoteLineItemRequest } from '@growflow/types';

export class CreateDeliveryNoteLineItemDto implements CreateDeliveryNoteLineItemRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  soLineItemId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  qty!: number;
}

export class CreateDeliveryNoteDto implements CreateDeliveryNoteRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  salesOrderId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliveryDate?: string;

  @ApiProperty({ type: [CreateDeliveryNoteLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryNoteLineItemDto)
  lineItems!: CreateDeliveryNoteLineItemDto[];
}
