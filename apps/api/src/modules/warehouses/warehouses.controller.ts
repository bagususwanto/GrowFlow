import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ListWarehousesQueryDto } from './dto/list-warehouses-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { WarehouseResponseEntity } from './entities/warehouse-response.entity';

@ApiTags('warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Roles('superadmin', 'manager')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully', type: WarehouseResponseEntity })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ status: 200, description: 'Return paginated warehouses' })
  findAll(@Query() query: ListWarehousesQueryDto) {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'Get a warehouse by id' })
  @ApiResponse({ status: 200, description: 'Return warehouse details', type: WarehouseResponseEntity })
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id')
  @Roles('superadmin', 'manager')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully', type: WarehouseResponseEntity })
  update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a warehouse' })
  @ApiResponse({ status: 204, description: 'Warehouse deleted successfully' })
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
