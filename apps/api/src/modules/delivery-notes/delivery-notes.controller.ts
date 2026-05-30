import { Controller, Get, Post, Body, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DeliveryNotesService } from './delivery-notes.service';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { ListDeliveryNotesQueryDto } from './dto/list-delivery-notes-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@growflow/types';
import { DeliveryNoteResponseEntity } from './entities/delivery-note-response.entity';

@ApiTags('delivery-notes')
@ApiBearerAuth()
@Controller('delivery-notes')
export class DeliveryNotesController {
  constructor(private readonly service: DeliveryNotesService) {}

  @Post()
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'Create a new Delivery Note in DRAFT status' })
  @ApiResponse({ status: 201, type: DeliveryNoteResponseEntity })
  create(
    @Body() dto: CreateDeliveryNoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Roles('superadmin', 'manager', 'staff', 'warehouse', 'finance')
  @ApiOperation({ summary: 'Get all Delivery Notes' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: ListDeliveryNotesQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles('superadmin', 'manager', 'staff', 'warehouse', 'finance')
  @ApiOperation({ summary: 'Get Delivery Note by ID' })
  @ApiResponse({ status: 200, type: DeliveryNoteResponseEntity })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/confirm')
  @Roles('superadmin', 'manager', 'warehouse')
  @ApiOperation({ summary: 'Confirm Delivery Note (DRAFT -> CONFIRMED, decreases stock)' })
  @ApiResponse({ status: 200, type: DeliveryNoteResponseEntity })
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.confirm(id, user.id);
  }

  @Delete(':id')
  @Roles('superadmin', 'manager', 'warehouse')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a Delivery Note (DRAFT only)' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
