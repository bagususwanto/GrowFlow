import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ItemsRepository, ItemWithCategory } from './items.repository';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { ItemResponseEntity } from './entities/item-response.entity';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  private mapToResponse(item: ItemWithCategory): ItemResponseEntity {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      categoryId: item.categoryId,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        description: item.category.description,
        isActive: item.category.isActive,
        deletedAt: item.category.deletedAt ? item.category.deletedAt.toISOString() : null,
        createdAt: item.category.createdAt.toISOString(),
        updatedAt: item.category.updatedAt.toISOString(),
      } : null,
      minStock: item.minStock,
      isActive: item.isActive,
      deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async findAll(query: ListItemsQueryDto): Promise<PaginatedResponse<ItemResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.itemsRepository.findAll(query, skip, limit);

    return {
      data: items.map(i => this.mapToResponse(i)),
      total,
      page,
      limit,
    };
  }


  async findOne(id: string): Promise<ItemResponseEntity> {
    const item = await this.itemsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return this.mapToResponse(item);
  }

  async create(dto: CreateItemDto): Promise<ItemResponseEntity> {
    const existing = await this.itemsRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Item with code ${dto.code} already exists`);
    }

    const item = await this.itemsRepository.create(dto);
    return this.mapToResponse(item);
  }

  async update(id: string, dto: UpdateItemDto): Promise<ItemResponseEntity> {
    const item = await this.itemsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    if (dto.code && dto.code !== item.code) {
      const existing = await this.itemsRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Item with code ${dto.code} already exists`);
      }
    }

    const updated = await this.itemsRepository.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const item = await this.itemsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    await this.itemsRepository.softDelete(id);
  }
}
