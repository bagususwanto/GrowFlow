import { Module } from '@nestjs/common';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoicesService } from './sales-invoices.service';
import { SalesInvoicesRepository } from './sales-invoices.repository';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [SalesInvoicesController],
  providers: [SalesInvoicesService, SalesInvoicesRepository],
  exports: [SalesInvoicesService],
})
export class SalesInvoicesModule {}
