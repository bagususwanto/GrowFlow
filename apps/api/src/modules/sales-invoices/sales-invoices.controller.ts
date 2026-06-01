import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { SalesInvoicesService } from './sales-invoices.service';
import { ListSalesInvoicesQueryDto } from './dto/list-sales-invoices-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { Response } from 'express';

@ApiTags('sales-invoices')
@ApiBearerAuth()
@Controller('sales-invoices')
export class SalesInvoicesController {
  constructor(private readonly service: SalesInvoicesService) {}

  @Get()
  @Roles('superadmin', 'manager', 'staff', 'finance')
  @ApiOperation({ summary: 'Get all Sales Invoices' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListSalesInvoicesQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles('superadmin', 'manager', 'staff', 'finance')
  @ApiOperation({ summary: 'Get Sales Invoice by ID' })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/send')
  @Roles('superadmin', 'manager', 'finance')
  @ApiOperation({ summary: 'Send Sales Invoice (DRAFT -> SENT)' })
  @ApiResponse({ status: 200 })
  send(@Param('id') id: string) {
    return this.service.send(id);
  }

  @Post(':id/payment')
  @Roles('superadmin', 'manager', 'finance')
  @ApiOperation({ summary: 'Record payment on Sales Invoice' })
  @ApiResponse({ status: 200 })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.recordPayment(id, dto, user.id);
  }

  @Post(':id/credit-note')
  @Roles('superadmin', 'manager', 'finance')
  @ApiOperation({ summary: 'Create and apply Credit Note on Sales Invoice' })
  @ApiResponse({ status: 200 })
  createCreditNote(
    @Param('id') id: string,
    @Body() dto: CreateCreditNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createCreditNote(id, dto, user.id);
  }

  @Post(':id/cancel')
  @Roles('superadmin', 'manager', 'finance')
  @ApiOperation({ summary: 'Cancel Sales Invoice' })
  @ApiResponse({ status: 200 })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
