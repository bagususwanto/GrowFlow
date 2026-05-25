import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ListPartnersQueryDto } from './dto/list-partners-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { PartnerResponseEntity } from './entities/partner-response.entity';

@ApiTags('partners')
@ApiBearerAuth()
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Roles('superadmin', 'manager')
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({ status: 201, description: 'Partner created successfully', type: PartnerResponseEntity })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  @Roles('superadmin', 'manager', 'staff', 'warehouse', 'finance')
  @ApiOperation({ summary: 'Get all partners' })
  @ApiResponse({ status: 200, description: 'Return paginated partners' })
  findAll(@Query() query: ListPartnersQueryDto) {
    return this.partnersService.findAll(query);
  }

  @Get(':id')
  @Roles('superadmin', 'manager', 'staff', 'warehouse', 'finance')
  @ApiOperation({ summary: 'Get a partner by id' })
  @ApiResponse({ status: 200, description: 'Return partner details', type: PartnerResponseEntity })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @Roles('superadmin', 'manager')
  @ApiOperation({ summary: 'Update a partner' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully', type: PartnerResponseEntity })
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a partner' })
  @ApiResponse({ status: 204, description: 'Partner deleted successfully' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
