import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

export type UserWithRole = User & { role: Role };

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip?: number, take?: number): Promise<UserWithRole[]> {
    return this.prisma.user.findMany({
      skip,
      take,
      include: { role: true },
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count({ where: { deletedAt: null } });
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
