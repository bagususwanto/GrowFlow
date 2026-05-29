import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Item, CategoryItem, Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';

export type ItemWithCategory = Item & { category: CategoryItem | null };

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListItemsQueryDto): Prisma.ItemWhereInput {
    const where: Prisma.ItemWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    return where;
  }

  async findAll(
    query: ListItemsQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[ItemWithCategory[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: { category: true },
      }),
      this.prisma.item.count({ where }),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<ItemWithCategory | null> {
    return this.prisma.item.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
  }

  async findByCode(code: string): Promise<ItemWithCategory | null> {
    return this.prisma.item.findFirst({
      where: { code, deletedAt: null },
      include: { category: true },
    });
  }

  async create(data: CreateItemDto): Promise<ItemWithCategory> {
    return this.prisma.item.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, data: UpdateItemDto): Promise<ItemWithCategory> {
    return this.prisma.item.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async softDelete(id: string): Promise<Item> {
    return this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
