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
    // Check if category is used by any items
    // Wait, since we have relation, we can check if it has items. However, our CategoryItemsRepository does not check this. We can do it via Prisma or we can just try to delete and let DB constraints throw error. Let's do a simple check.
    // Actually, DB constraints will raise a foreign key constraint violation. Let's catch it, or just let NestJS exception filter handle it.
    // Let's implement a clean delete.
    try {
      await this.categoryItemsRepository.delete(id);
    } catch (error) {
      // Prisma error for foreign key constraint violation is P2003
      throw new ConflictException('Cannot delete category because it is being used by one or more items.');
    }
  }
}
