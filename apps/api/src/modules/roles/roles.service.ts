import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginatedResponse } from '@growflow/types';
import { RoleResponseEntity } from './entities/role-response.entity';
import { Role } from '@prisma/client';

import { ListRolesQueryDto } from './dto/list-roles-query.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  private mapToResponse(role: Role): RoleResponseEntity {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions as any[],
      isActive: role.isActive,
      deletedAt: role.deletedAt ? role.deletedAt.toISOString() : null,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }

  async findAll(query: ListRolesQueryDto): Promise<PaginatedResponse<RoleResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [roles, total] = await this.rolesRepository.findAll(query, skip, limit);

    return {
      data: roles.map(role => this.mapToResponse(role)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<RoleResponseEntity> {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return this.mapToResponse(role);
  }

  async create(dto: CreateRoleDto): Promise<RoleResponseEntity> {
    const existing = await this.rolesRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Role with name ${dto.name} already exists`);
    }

    const role = await this.rolesRepository.create(dto);
    return this.mapToResponse(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleResponseEntity> {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.rolesRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Role with name ${dto.name} already exists`);
      }
    }

    const updated = await this.rolesRepository.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    try {
      await this.rolesRepository.remove(id);
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Cannot delete role because it is assigned to existing users.');
      }
      throw error;
    }
  }
}
