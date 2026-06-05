import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DateRangeReportFilterDto {
  @ApiPropertyOptional({ description: 'Start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsString()
  @IsOptional()
  endDate?: string;
}

export class AgingReportFilterDto {
  @ApiPropertyOptional({ description: 'As of date' })
  @IsString()
  @IsOptional()
  asOf?: string;
}
