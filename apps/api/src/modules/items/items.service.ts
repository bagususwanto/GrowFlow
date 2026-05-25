import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ItemsRepository } from './items.repository';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { ItemResponseEntity } from './entities/item-response.entity';
import { Item, Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  private mapToResponse(item: Item): ItemResponseEntity {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      category: item.category,
      minStock: item.minStock,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async findAll(query: ListItemsQueryDto): Promise<PaginatedResponse<ItemResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = { deletedAt: null };
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    
    if (query.category) {
      where.category = query.category;
    }

    const [items, total] = await this.itemsRepository.findAll({ skip, take: limit, where });

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
