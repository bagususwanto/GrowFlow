import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { GetItemLastPriceQueryDto } from './dto/get-item-last-price-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ItemResponseEntity } from './entities/item-response.entity';

@ApiTags('items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles('superadmin', 'manager')
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully', type: ItemResponseEntity })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Return paginated items' })
  findAll(@Query() query: ListItemsQueryDto) {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  @Roles('superadmin', 'manager', 'staff', 'warehouse')
  @ApiOperation({ summary: 'Get an item by id' })
  @ApiResponse({ status: 200, description: 'Return item details', type: ItemResponseEntity })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Get(':id/last-price')
  @Roles('superadmin', 'manager', 'staff', 'warehouse', 'finance')
  @ApiOperation({ summary: 'Get last purchase or sales price of an item' })
  @ApiResponse({ status: 200, description: 'Return last price of the item' })
  getLastPrice(
    @Param('id') id: string,
    @Query() query: GetItemLastPriceQueryDto,
  ) {
    return this.itemsService.getLastPrice(id, query.type);
  }

  @Patch(':id')
  @Roles('superadmin', 'manager')
  @ApiOperation({ summary: 'Update an item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully', type: ItemResponseEntity })
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  @Roles('superadmin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an item' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
