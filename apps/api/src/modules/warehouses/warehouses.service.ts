import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { WarehousesRepository } from './warehouses.repository';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ListWarehousesQueryDto } from './dto/list-warehouses-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { WarehouseResponseEntity } from './entities/warehouse-response.entity';
import { Warehouse } from '@prisma/client';

@Injectable()
export class WarehousesService {
  constructor(private readonly warehousesRepository: WarehousesRepository) {}

  private mapToResponse(warehouse: Warehouse): WarehouseResponseEntity {
    return {
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt.toISOString(),
      updatedAt: warehouse.updatedAt.toISOString(),
    };
  }

  async findAll(query: ListWarehousesQueryDto): Promise<PaginatedResponse<WarehouseResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [warehouses, total] = await this.warehousesRepository.findAll(query, skip, limit);

    return {
      data: warehouses.map(w => this.mapToResponse(w)),
      total,
      page,
      limit,
    };
  }


  async findOne(id: string): Promise<WarehouseResponseEntity> {
    const warehouse = await this.warehousesRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return this.mapToResponse(warehouse);
  }

  async create(dto: CreateWarehouseDto): Promise<WarehouseResponseEntity> {
    const existing = await this.warehousesRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Warehouse with name ${dto.name} already exists`);
    }

    const warehouse = await this.warehousesRepository.create(dto);
    return this.mapToResponse(warehouse);
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<WarehouseResponseEntity> {
    const warehouse = await this.warehousesRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    if (dto.name && dto.name !== warehouse.name) {
      const existing = await this.warehousesRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Warehouse with name ${dto.name} already exists`);
      }
    }

    const updated = await this.warehousesRepository.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.warehousesRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    await this.warehousesRepository.softDelete(id);
  }
}
