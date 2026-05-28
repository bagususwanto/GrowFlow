import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CategoryItem, Prisma } from '@prisma/client';
import { CreateCategoryItemDto } from './dto/create-category-item.dto';
import { UpdateCategoryItemDto } from './dto/update-category-item.dto';
import { ListCategoryItemsQueryDto } from './dto/list-category-items-query.dto';

@Injectable()
export class CategoryItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListCategoryItemsQueryDto): Prisma.CategoryItemWhereInput {
    const where: Prisma.CategoryItemWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findAll(
    query: ListCategoryItemsQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[CategoryItem[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.categoryItem.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.categoryItem.count({ where }),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<CategoryItem | null> {
    return this.prisma.categoryItem.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<CategoryItem | null> {
    return this.prisma.categoryItem.findFirst({
      where: { name },
    });
  }

  async create(data: CreateCategoryItemDto): Promise<CategoryItem> {
    return this.prisma.categoryItem.create({
      data,
    });
  }

  async update(id: string, data: UpdateCategoryItemDto): Promise<CategoryItem> {
    return this.prisma.categoryItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<CategoryItem> {
    return this.prisma.categoryItem.delete({
      where: { id },
    });
  }
}
