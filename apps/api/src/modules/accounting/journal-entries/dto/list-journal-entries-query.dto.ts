import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JournalEntryStatus } from '@growflow/types';

export class ListJournalEntriesQueryDto {
  @ApiPropertyOptional({ description: 'Search term for journal number or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['DRAFT', 'POSTED', 'CANCELLED'] })
  @IsEnum(['DRAFT', 'POSTED', 'CANCELLED'])
  @IsOptional()
  status?: JournalEntryStatus;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Limit' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
