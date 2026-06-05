import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJournalEntryRequest } from '@growflow/types';

export class JournalLineDto {
  @ApiProperty({ description: 'The target account ID' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @ApiProperty({ description: 'Debit amount' })
  @IsNumber()
  @Min(0)
  debit!: number;

  @ApiProperty({ description: 'Credit amount' })
  @IsNumber()
  @Min(0)
  credit!: number;

  @ApiPropertyOptional({ description: 'Line item description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateJournalEntryDto implements CreateJournalEntryRequest {
  @ApiPropertyOptional({ description: 'The entry date' })
  @IsString()
  @IsOptional()
  entryDate?: string;

  @ApiPropertyOptional({ description: 'Description/memo for the journal entry' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Journal lines', type: [JournalLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines!: JournalLineDto[];
}
