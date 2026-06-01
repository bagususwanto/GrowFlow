import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CreateCreditNoteRequest } from '@growflow/types';
import { Type } from 'class-transformer';

export class CreateCreditNoteDto implements CreateCreditNoteRequest {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty()
  @IsString()
  reason!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
