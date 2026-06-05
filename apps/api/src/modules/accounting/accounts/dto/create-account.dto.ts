import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { CreateAccountRequest, AccountType, AccountCategory } from '@growflow/types';

export class CreateAccountDto implements CreateAccountRequest {
  @ApiProperty({ description: 'The unique code of the account' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'The name of the account' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The type of the account', enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] })
  @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  @IsNotEmpty()
  type!: AccountType;

  @ApiProperty({
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
  @IsNotEmpty()
  category!: AccountCategory;

  @ApiPropertyOptional({ description: 'The parent account ID for hierarchical grouping' })
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Is the account active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
