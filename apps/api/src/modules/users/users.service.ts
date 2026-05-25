import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository, UserWithRole } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PaginatedResponse } from '@growflow/types';
import { UserResponseEntity } from './entities/user-response.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private mapToResponse(user: UserWithRole): UserResponseEntity {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name as any,
      },
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResponse<UserResponseEntity>> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.usersRepository.findAll(skip, limit),
      this.usersRepository.count(),
    ]);

    return {
      data: users.map(user => this.mapToResponse(user)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<UserResponseEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapToResponse(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseEntity> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      roleId: dto.roleId,
      passwordHash,
    });

    return this.mapToResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    let passwordHash = user.passwordHash;
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(dto.password, salt);
    }

    const updated = await this.usersRepository.update(id, {
      name: dto.name,
      email: dto.email,
      roleId: dto.roleId,
      isActive: dto.isActive,
      passwordHash,
    });

    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.softDelete(id);
  }
}
