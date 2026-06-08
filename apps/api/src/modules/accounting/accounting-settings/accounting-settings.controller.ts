import { Controller, Get, Patch, Body } from '@nestjs/common';
import { AccountingSettingsService } from './accounting-settings.service';
import { UpdateAccountingSettingsDto } from './dto/update-accounting-settings.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('accounting-settings')
@ApiBearerAuth()
@Controller('accounting/settings')
export class AccountingSettingsController {
  constructor(private readonly settingsService: AccountingSettingsService) {}

  @Get()
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get default accounting settings/mappings' })
  @ApiResponse({ status: 200, description: 'Return default settings' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @Permissions('update:accounting')
  @ApiOperation({ summary: 'Update default accounting settings/mappings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  updateSettings(@Body() updateDto: UpdateAccountingSettingsDto) {
    return this.settingsService.updateSettings(updateDto);
  }
}
