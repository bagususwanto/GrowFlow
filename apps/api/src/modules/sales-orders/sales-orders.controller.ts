import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { ListSalesOrdersQueryDto } from './dto/list-sales-orders-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { SalesOrderResponseEntity } from './entities/sales-order-response.entity';

@ApiTags('sales-orders')
@ApiBearerAuth()
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly service: SalesOrdersService) {}

  @Post()
  @Permissions('create:sales-orders')
  @ApiOperation({ summary: 'Create a new Sales Order in DRAFT status' })
  @ApiResponse({ status: 201, type: SalesOrderResponseEntity })
  create(
    @Body() dto: CreateSalesOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Permissions('read:sales-orders')
  @ApiOperation({ summary: 'Get all Sales Orders' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListSalesOrdersQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('read:sales-orders')
  @ApiOperation({ summary: 'Get Sales Order by ID' })
  @ApiResponse({ status: 200, type: SalesOrderResponseEntity })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions('update:sales-orders')
  @ApiOperation({ summary: 'Update a Sales Order (DRAFT only)' })
  @ApiResponse({ status: 200, type: SalesOrderResponseEntity })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/confirm')
  @Permissions('confirm:sales-orders')
  @ApiOperation({ summary: 'Confirm a Sales Order (DRAFT -> CONFIRMED, validates stock)' })
  @ApiResponse({ status: 200, type: SalesOrderResponseEntity })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.confirm(id, user.id);
  }

  @Post(':id/cancel')
  @Permissions('cancel:sales-orders')
  @ApiOperation({ summary: 'Cancel a Sales Order' })
  @ApiResponse({ status: 200, type: SalesOrderResponseEntity })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Delete(':id')
  @Permissions('delete:sales-orders')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a Sales Order (DRAFT only)' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
