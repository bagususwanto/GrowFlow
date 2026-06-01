import { Module } from '@nestjs/common';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoicesService } from './sales-invoices.service';
import { SalesInvoicesRepository } from './sales-invoices.repository';

@Module({
  controllers: [SalesInvoicesController],
  providers: [SalesInvoicesService, SalesInvoicesRepository],
  exports: [SalesInvoicesService],
})
export class SalesInvoicesModule {}
