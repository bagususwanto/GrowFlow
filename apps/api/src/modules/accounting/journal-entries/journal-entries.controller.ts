import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ListJournalEntriesQueryDto } from './dto/list-journal-entries-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';

@ApiTags('accounting-journal-entries')
@ApiBearerAuth()
@Controller('accounting/journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  @Permissions('create:accounting')
  @ApiOperation({ summary: 'Create a manual journal entry in DRAFT status' })
  @ApiResponse({ status: 201, description: 'Journal entry draft created successfully' })
  create(
    @Body() createJournalEntryDto: CreateJournalEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.journalEntriesService.createManual(createJournalEntryDto, user.id);
  }

  @Get()
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get all journal entries' })
  @ApiResponse({ status: 200, description: 'Return paginated journal entries' })
  findAll(@Query() query: ListJournalEntriesQueryDto) {
    return this.journalEntriesService.findAll(query);
  }

  @Get(':id')
  @Permissions('read:accounting')
  @ApiOperation({ summary: 'Get a journal entry by id' })
  @ApiResponse({ status: 200, description: 'Return journal entry details' })
  findOne(@Param('id') id: string) {
    return this.journalEntriesService.findOne(id);
  }

  @Patch(':id/post')
  @Permissions('update:accounting')
  @ApiOperation({ summary: 'Post a journal entry draft to ledger' })
  @ApiResponse({ status: 200, description: 'Journal entry posted successfully' })
  post(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.journalEntriesService.post(id, user.id);
  }

  @Patch(':id/cancel')
  @Permissions('update:accounting')
  @ApiOperation({ summary: 'Cancel a journal entry draft' })
  @ApiResponse({ status: 200, description: 'Journal entry cancelled successfully' })
  cancel(@Param('id') id: string) {
    return this.journalEntriesService.cancel(id);
  }
}
