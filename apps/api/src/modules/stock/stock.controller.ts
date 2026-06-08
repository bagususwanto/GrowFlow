import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { ListStockMutationsQueryDto } from './dto/list-stock-mutations-query.dto';
import { ListStockBalancesQueryDto } from './dto/list-stock-balances-query.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { StockBalanceResponseEntity } from './entities/stock-balance-response.entity';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('balance/:warehouseId/:itemId')
  @Permissions('read:stock')
  @ApiOperation({ summary: 'Get stock balance for a specific item in a warehouse' })
  @ApiResponse({ status: 200, type: StockBalanceResponseEntity })
  getBalance(
    @Param('itemId') itemId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.stockService.getBalance(itemId, warehouseId);
  }

  @Post('adjust')
  @Permissions('write:stock')
  @ApiOperation({ summary: 'Adjust stock balance manually' })
  @ApiResponse({ status: 201, description: 'Stock adjusted' })
  adjustStock(
    @Body() adjustDto: StockAdjustmentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stockService.adjustStock(adjustDto, user.id);
  }

  @Get('mutations')
  @Permissions('read:stock')
  @ApiOperation({ summary: 'List stock mutations with filters' })
  @ApiResponse({ status: 200, description: 'Paginated stock mutations' })
  listMutations(@Query() query: ListStockMutationsQueryDto) {
    return this.stockService.listMutations(query);
  }

  @Get('balance')
  @Permissions('read:stock')
  @ApiOperation({ summary: 'List stock balances with filters' })
  @ApiResponse({ status: 200, description: 'Paginated stock balances' })
  listBalances(@Query() query: ListStockBalancesQueryDto) {
    return this.stockService.listBalances(query);
  }
}
