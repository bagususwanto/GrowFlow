import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ListPurchaseOrdersQueryDto } from './dto/list-purchase-orders-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { PurchaseOrderResponseEntity } from './entities/purchase-order-response.entity';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post()
  @Permissions('create:purchase-orders')
  @ApiOperation({ summary: 'Create a new Purchase Order in DRAFT status' })
  @ApiResponse({ status: 201, type: PurchaseOrderResponseEntity })
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Permissions('read:purchase-orders')
  @ApiOperation({ summary: 'Get all Purchase Orders' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListPurchaseOrdersQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('read:purchase-orders')
  @ApiOperation({ summary: 'Get Purchase Order by ID' })
  @ApiResponse({ status: 200, type: PurchaseOrderResponseEntity })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('update:purchase-orders')
  @ApiOperation({ summary: 'Update a Purchase Order (DRAFT only)' })
  @ApiResponse({ status: 200, type: PurchaseOrderResponseEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  @Permissions('submit:purchase-orders')
  @ApiOperation({ summary: 'Submit a Purchase Order (DRAFT -> SUBMITTED)' })
  @ApiResponse({ status: 200, type: PurchaseOrderResponseEntity })
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/approve')
  @Permissions('approve:purchase-orders')
  @ApiOperation({ summary: 'Approve a Purchase Order (SUBMITTED -> APPROVED)' })
  @ApiResponse({ status: 200, type: PurchaseOrderResponseEntity })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.approve(id, user.id);
  }

  @Post(':id/cancel')
  @Permissions('cancel:purchase-orders')
  @ApiOperation({ summary: 'Cancel a Purchase Order' })
  @ApiResponse({ status: 200, type: PurchaseOrderResponseEntity })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Delete(':id')
  @Permissions('delete:purchase-orders')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a Purchase Order (DRAFT only)' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
