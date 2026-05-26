import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Item, Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';


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

    if (query.category) {
      where.category = query.category;
    }

    return where;
  }

  async findAll(
    query: ListItemsQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[Item[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.item.count({ where }),
    ]);
    return [data, total];
  }


  async findById(id: string): Promise<Item | null> {
    return this.prisma.item.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string): Promise<Item | null> {
    return this.prisma.item.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async create(data: CreateItemDto): Promise<Item> {
    return this.prisma.item.create({
      data,
    });
  }

  async update(id: string, data: UpdateItemDto): Promise<Item> {
    return this.prisma.item.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Item> {
    return this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
