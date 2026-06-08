import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ListWarehousesQueryDto } from './dto/list-warehouses-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { WarehouseResponseEntity } from './entities/warehouse-response.entity';

@ApiTags('warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Permissions('create:warehouses')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully', type: WarehouseResponseEntity })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @Permissions('read:warehouses')
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ status: 200, description: 'Return paginated warehouses' })
  findAll(@Query() query: ListWarehousesQueryDto) {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @Permissions('read:warehouses')
  @ApiOperation({ summary: 'Get a warehouse by id' })
  @ApiResponse({ status: 200, description: 'Return warehouse details', type: WarehouseResponseEntity })
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('update:warehouses')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully', type: WarehouseResponseEntity })
  update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @Permissions('delete:warehouses')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a warehouse' })
  @ApiResponse({ status: 204, description: 'Warehouse deleted successfully' })
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
