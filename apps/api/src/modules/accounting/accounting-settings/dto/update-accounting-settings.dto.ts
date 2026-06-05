import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateAccountingSettingsRequest } from '@growflow/types';

export class UpdateAccountingSettingsDto implements UpdateAccountingSettingsRequest {
  @ApiPropertyOptional({ description: 'AP Account ID (Hutang Dagang)' })
  @IsString()
  @IsOptional()
  apAccountId?: string;

  @ApiPropertyOptional({ description: 'AR Account ID (Piutang Dagang)' })
  @IsString()
  @IsOptional()
  arAccountId?: string;

  @ApiPropertyOptional({ description: 'Cash/Bank Account ID' })
  @IsString()
  @IsOptional()
  cashAccountId?: string;

  @ApiPropertyOptional({ description: 'Inventory Account ID (Persediaan Barang)' })
  @IsString()
  @IsOptional()
  inventoryAccountId?: string;

  @ApiPropertyOptional({ description: 'COGS Account ID' })
  @IsString()
  @IsOptional()
  cogsAccountId?: string;

  @ApiPropertyOptional({ description: 'Revenue Account ID (Pendapatan Penjualan)' })
  @IsString()
  @IsOptional()
  revenueAccountId?: string;

  @ApiPropertyOptional({ description: 'Purchase Expense Account ID' })
  @IsString()
  @IsOptional()
  purchaseAccountId?: string;
}
