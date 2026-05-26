import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Item, Prisma } from '@prisma/client';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ItemWhereInput;
  }): Promise<[Item[], number]> {
    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        skip: params.skip,
        take: params.take,
        where: params.where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.item.count({ where: params.where }),
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
