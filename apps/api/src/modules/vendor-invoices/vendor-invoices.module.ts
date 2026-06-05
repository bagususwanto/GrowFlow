import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';
import { VendorInvoicesController } from './vendor-invoices.controller';
import { VendorInvoicesService } from './vendor-invoices.service';
import { VendorInvoicesRepository } from './vendor-invoices.repository';

@Module({
  imports: [PrismaModule, AccountingModule],
  controllers: [VendorInvoicesController],
  providers: [VendorInvoicesService, VendorInvoicesRepository],
  exports: [VendorInvoicesService],
})
export class VendorInvoicesModule {}
