import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip?: number, take?: number): Promise<Role[]> {
    return this.prisma.role.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.role.count();
  }

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
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
      },
    });
  }

  async remove(id: string): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
