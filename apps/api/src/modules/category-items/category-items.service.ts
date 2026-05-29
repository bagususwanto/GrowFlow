import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryItemsRepository } from './category-items.repository';
import { CreateCategoryItemDto } from './dto/create-category-item.dto';
import { UpdateCategoryItemDto } from './dto/update-category-item.dto';
import { ListCategoryItemsQueryDto } from './dto/list-category-items-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { CategoryItemResponseEntity } from './entities/category-item-response.entity';
import { CategoryItem } from '@prisma/client';

@Injectable()
export class CategoryItemsService {
  constructor(private readonly categoryItemsRepository: CategoryItemsRepository) {}

  private mapToResponse(categoryItem: CategoryItem): CategoryItemResponseEntity {
    return {
      id: categoryItem.id,
      name: categoryItem.name,
      description: categoryItem.description,
      isActive: categoryItem.isActive,
      deletedAt: categoryItem.deletedAt ? categoryItem.deletedAt.toISOString() : null,
      createdAt: categoryItem.createdAt.toISOString(),
      updatedAt: categoryItem.updatedAt.toISOString(),
    };
  }

  async findAll(query: ListCategoryItemsQueryDto): Promise<PaginatedResponse<CategoryItemResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoryItemsRepository.findAll(query, skip, limit);

    return {
      data: categories.map(c => this.mapToResponse(c)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<CategoryItemResponseEntity> {
    const category = await this.categoryItemsRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.mapToResponse(category);
  }

  async create(dto: CreateCategoryItemDto): Promise<CategoryItemResponseEntity> {
    const existing = await this.categoryItemsRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Category with name ${dto.name} already exists`);
    }

    const category = await this.categoryItemsRepository.create(dto);
    return this.mapToResponse(category);
  }

  async update(id: string, dto: UpdateCategoryItemDto): Promise<CategoryItemResponseEntity> {
    const category = await this.categoryItemsRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryItemsRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Category with name ${dto.name} already exists`);
      }
    }

    const updated = await this.categoryItemsRepository.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryItemsRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const activeItemsCount = await this.categoryItemsRepository.countActiveItems(id);
    if (activeItemsCount > 0) {
      throw new ConflictException('Cannot delete category because it is being used by one or more items.');
    }

    await this.categoryItemsRepository.softDelete(id);
  }
}
