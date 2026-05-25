import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { ListStockMutationsQueryDto } from './dto/list-stock-mutations-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { StockBalanceResponseEntity } from './entities/stock-balance-response.entity';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('balance/:warehouseId/:itemId')
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'Get stock balance for a specific item in a warehouse' })
  @ApiResponse({ status: 200, type: StockBalanceResponseEntity })
  getBalance(
    @Param('itemId') itemId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.stockService.getBalance(itemId, warehouseId);
  }

  @Post('adjust')
  @Roles('superadmin', 'manager', 'warehouse')
  @ApiOperation({ summary: 'Adjust stock balance manually' })
  @ApiResponse({ status: 201, description: 'Stock adjusted' })
  adjustStock(
    @Body() adjustDto: StockAdjustmentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stockService.adjustStock(adjustDto, user.id);
  }

  @Get('mutations')
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'List stock mutations with filters' })
  @ApiResponse({ status: 200, description: 'Paginated stock mutations' })
  listMutations(@Query() query: ListStockMutationsQueryDto) {
    return this.stockService.listMutations(query);
  }
}
