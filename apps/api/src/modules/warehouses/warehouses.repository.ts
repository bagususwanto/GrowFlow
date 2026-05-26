import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Warehouse, Prisma } from '@prisma/client';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ListWarehousesQueryDto } from './dto/list-warehouses-query.dto';

@Injectable()
export class WarehousesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: ListWarehousesQueryDto): Prisma.WarehouseWhereInput {
    const where: Prisma.WarehouseWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return where;
  }

  async findAll(
    query: ListWarehousesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[Warehouse[], number]> {
    const where = this.buildWhereClause(query);
    const orderBy = { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    return [data, total];
  }


  async findById(id: string): Promise<Warehouse | null> {
    return this.prisma.warehouse.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<Warehouse | null> {
    return this.prisma.warehouse.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    return this.prisma.warehouse.create({
      data,
    });
  }

  async update(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
