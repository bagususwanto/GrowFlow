import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { User, Role, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';

export type UserWithRole = User & { role: Role };

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: FindAllUsersDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    
    if (query.roleId) {
      where.roleId = query.roleId;
    }
    
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    
    return where;
  }

  async findAll(query: FindAllUsersDto, skip?: number, take?: number): Promise<UserWithRole[]> {
    const where = this.buildWhereClause(query);
    const orderBy = { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' };

    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { role: true },
    });
  }

  async count(query: FindAllUsersDto): Promise<number> {
    const where = this.buildWhereClause(query);
    return this.prisma.user.count({ where });
  }

  async findById(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { role: true },
    });
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });
  }

  async create(data: Omit<CreateUserDto, 'password'> & { passwordHash: string }): Promise<UserWithRole> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
      },
      include: { role: true },
    });
  }

  async update(id: string, data: Partial<Omit<CreateUserDto, 'password'> & { passwordHash: string; isActive: boolean }>): Promise<UserWithRole> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async softDelete(id: string): Promise<UserWithRole> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      include: { role: true },
    });
  }
}
