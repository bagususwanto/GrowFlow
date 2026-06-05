import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountType, AccountCategory } from '@growflow/types';

export class ListAccountsQueryDto {
  @ApiPropertyOptional({ description: 'Search term for code or name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by account type', enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] })
  @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  @IsOptional()
  type?: AccountType;

  @ApiPropertyOptional({
    description: 'Filter by account category',
    enum: [
      'CURRENT_ASSET',
      'FIXED_ASSET',
      'CURRENT_LIABILITY',
      'LONG_TERM_LIABILITY',
      'EQUITY',
      'REVENUE',
      'COGS',
      'OPERATING_EXPENSE',
      'OTHER_EXPENSE',
      'OTHER_INCOME',
    ],
  })
  @IsEnum([
    'CURRENT_ASSET',
    'FIXED_ASSET',
    'CURRENT_LIABILITY',
    'LONG_TERM_LIABILITY',
    'EQUITY',
    'REVENUE',
    'COGS',
    'OPERATING_EXPENSE',
    'OTHER_EXPENSE',
    'OTHER_INCOME',
  ])
  @IsOptional()
  category?: AccountCategory;
}
