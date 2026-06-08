import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { DateRangeReportFilterDto, AgingReportFilterDto } from './dto/report-filter.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('accounting-reports')
@ApiBearerAuth()
@Controller('accounting/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get Trial Balance report' })
  @ApiResponse({ status: 200, description: 'Return Trial Balance data' })
  getTrialBalance(@Query() filter: DateRangeReportFilterDto) {
    return this.reportsService.getTrialBalance(filter.startDate, filter.endDate);
  }

  @Get('profit-loss')
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get Profit and Loss report' })
  @ApiResponse({ status: 200, description: 'Return Profit and Loss data' })
  getProfitLoss(@Query() filter: DateRangeReportFilterDto) {
    return this.reportsService.getProfitLoss(filter.startDate, filter.endDate);
  }

  @Get('ap-aging')
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get Accounts Payable (AP) Aging report' })
  @ApiResponse({ status: 200, description: 'Return AP Aging data' })
  getAPAging(@Query() filter: AgingReportFilterDto) {
    return this.reportsService.getAPAging(filter.asOf);
  }

  @Get('ar-aging')
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get Accounts Receivable (AR) Aging report' })
  @ApiResponse({ status: 200, description: 'Return AR Aging data' })
  getARAging(@Query() filter: AgingReportFilterDto) {
    return this.reportsService.getARAging(filter.asOf);
  }
}
