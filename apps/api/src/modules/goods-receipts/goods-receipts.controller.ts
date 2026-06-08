import { Controller, Get, Post, Body, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { ListGoodsReceiptsQueryDto } from './dto/list-goods-receipts-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { GoodsReceiptResponseEntity } from './entities/goods-receipt-response.entity';

@ApiTags('goods-receipts')
@ApiBearerAuth()
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly service: GoodsReceiptsService) {}

  @Post()
  @Permissions('create:goods-receipts')
  @ApiOperation({ summary: 'Create a new Goods Receipt in DRAFT status' })
  @ApiResponse({ status: 201, type: GoodsReceiptResponseEntity })
  create(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Permissions('read:goods-receipts')
  @ApiOperation({ summary: 'Get all Goods Receipts' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListGoodsReceiptsQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('read:goods-receipts')
  @ApiOperation({ summary: 'Get Goods Receipt by ID' })
  @ApiResponse({ status: 200, type: GoodsReceiptResponseEntity })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/confirm')
  @Permissions('confirm:goods-receipts')
  @ApiOperation({ summary: 'Confirm a Goods Receipt (adds to stock & updates PO status)' })
  @ApiResponse({ status: 200, type: GoodsReceiptResponseEntity })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.confirm(id, user.id);
  }

  @Delete(':id')
  @Permissions('delete:goods-receipts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a Goods Receipt (DRAFT only)' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
