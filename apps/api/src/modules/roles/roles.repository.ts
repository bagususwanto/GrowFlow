import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListRolesQueryDto } from './dto/list-roles-query.dto';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListRolesQueryDto): Prisma.RoleWhereInput {
    const where: Prisma.RoleWhereInput = {
      deletedAt: null,
    };
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }
    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }
    return where;
  }

  async findAll(
    query: ListRolesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[Role[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.role.count({ where }),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: CreateRoleDto): Promise<Role> {
    return this.prisma.role.create({
      data: {
        name: data.name,
        permissions: data.permissions ? data.permissions : [],
      },
    });
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.permissions && { permissions: data.permissions }),
        ...(typeof data.isActive === 'boolean' && { isActive: data.isActive }),
      },
    });
  }

  async remove(id: string): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
