import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { VendorInvoicesService } from './vendor-invoices.service';
import { ListVendorInvoicesQueryDto } from './dto/list-vendor-invoices-query.dto';
import { ReceiveVendorInvoiceDto } from './dto/receive-vendor-invoice.dto';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';

@ApiTags('vendor-invoices')
@ApiBearerAuth()
@Controller('vendor-invoices')
export class VendorInvoicesController {
  constructor(private readonly vendorInvoicesService: VendorInvoicesService) {}

  @Get()
  @Roles('superadmin', 'finance', 'manager')
  @ApiOperation({ summary: 'Get all vendor invoices (bills)' })
  @ApiResponse({ status: 200, description: 'Return paginated vendor invoices' })
  findAll(@Query() query: ListVendorInvoicesQueryDto) {
    return this.vendorInvoicesService.findAll(query);
  }

  @Get(':id')
  @Roles('superadmin', 'finance', 'manager')
  @ApiOperation({ summary: 'Get vendor invoice details by ID' })
  @ApiResponse({ status: 200, description: 'Return vendor invoice details' })
  findOne(@Param('id') id: string) {
    return this.vendorInvoicesService.findOne(id);
  }

  @Patch(':id/receive')
  @Roles('superadmin', 'finance')
  @ApiOperation({ summary: 'Mark draft vendor invoice as RECEIVED (posts ledger journal)' })
  @ApiResponse({ status: 200, description: 'Invoice status updated to RECEIVED' })
  receive(
    @Param('id') id: string,
    @Body() dto: ReceiveVendorInvoiceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vendorInvoicesService.receive(id, dto, user.id);
  }

  @Post(':id/payments')
  @Roles('superadmin', 'finance')
  @ApiOperation({ summary: 'Record AP payment on vendor invoice' })
  @ApiResponse({ status: 201, description: 'Payment recorded and ledger journal posted' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: CreateVendorPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vendorInvoicesService.recordPayment(id, dto, user.id);
  }

  @Patch(':id/cancel')
  @Roles('superadmin', 'finance')
  @ApiOperation({ summary: 'Cancel a draft vendor invoice' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled' })
  cancel(@Param('id') id: string) {
    return this.vendorInvoicesService.cancel(id);
  }
}
