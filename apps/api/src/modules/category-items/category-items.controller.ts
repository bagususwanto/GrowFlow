import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryItemsService } from './category-items.service';
import { CreateCategoryItemDto } from './dto/create-category-item.dto';
import { UpdateCategoryItemDto } from './dto/update-category-item.dto';
import { ListCategoryItemsQueryDto } from './dto/list-category-items-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CategoryItemResponseEntity } from './entities/category-item-response.entity';

@ApiTags('category-items')
@ApiBearerAuth()
@Controller('category-items')
export class CategoryItemsController {
  constructor(private readonly categoryItemsService: CategoryItemsService) {}

  @Post()
  @Permissions('create:category-items')
  @ApiOperation({ summary: 'Create a new item category' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryItemResponseEntity })
  create(@Body() createCategoryItemDto: CreateCategoryItemDto) {
    return this.categoryItemsService.create(createCategoryItemDto);
  }

  @Get()
  @Permissions('read:category-items')
  @ApiOperation({ summary: 'Get all item categories' })
  @ApiResponse({ status: 200, description: 'Return paginated item categories' })
  findAll(@Query() query: ListCategoryItemsQueryDto) {
    return this.categoryItemsService.findAll(query);
  }

  @Get(':id')
  @Permissions('read:category-items')
  @ApiOperation({ summary: 'Get an item category by id' })
  @ApiResponse({ status: 200, description: 'Return category details', type: CategoryItemResponseEntity })
  findOne(@Param('id') id: string) {
    return this.categoryItemsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('update:category-items')
  @ApiOperation({ summary: 'Update an item category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: CategoryItemResponseEntity })
  update(@Param('id') id: string, @Body() updateCategoryItemDto: UpdateCategoryItemDto) {
    return this.categoryItemsService.update(id, updateCategoryItemDto);
  }

  @Delete(':id')
  @Permissions('delete:category-items')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an item category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  remove(@Param('id') id: string) {
    return this.categoryItemsService.remove(id);
  }
}
