import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { AccountsRepository } from './accounts/accounts.repository';
import { JournalEntriesController } from './journal-entries/journal-entries.controller';
import { JournalEntriesService } from './journal-entries/journal-entries.service';
import { JournalEntriesRepository } from './journal-entries/journal-entries.repository';
import { AccountingSettingsController } from './accounting-settings/accounting-settings.controller';
import { AccountingSettingsService } from './accounting-settings/accounting-settings.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AccountsController,
    JournalEntriesController,
    AccountingSettingsController,
    ReportsController,
  ],
  providers: [
    AccountsService,
    AccountsRepository,
    JournalEntriesService,
    JournalEntriesRepository,
    AccountingSettingsService,
    ReportsService,
  ],
  exports: [JournalEntriesService],
})
export class AccountingModule {}
