import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser, DashboardSummaryResponse } from '@growflow/types';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Permissions('read:dashboard')
  @ApiOperation({ summary: 'Get summary statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Return summary statistics' })
  getSummary(@CurrentUser() user: AuthUser): Promise<DashboardSummaryResponse> {
    return this.dashboardService.getSummary(user.role);
  }
}
