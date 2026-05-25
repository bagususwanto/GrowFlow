import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Warehouse, Prisma } from '@prisma/client';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WarehouseWhereInput;
  }): Promise<[Warehouse[], number]> {
    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        skip: params.skip,
        take: params.take,
        where: params.where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warehouse.count({ where: params.where }),
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
