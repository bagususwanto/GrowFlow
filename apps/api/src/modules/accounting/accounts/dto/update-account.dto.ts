import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { UpdateAccountRequest, AccountType, AccountCategory } from '@growflow/types';

export class UpdateAccountDto implements UpdateAccountRequest {
  @ApiPropertyOptional({ description: 'The name of the account' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'The type of the account', enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] })
  @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  @IsOptional()
  type?: AccountType;

  @ApiPropertyOptional({
    description: 'The category of the account',
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

  @ApiPropertyOptional({ description: 'The parent account ID for hierarchical grouping' })
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Is the account active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
