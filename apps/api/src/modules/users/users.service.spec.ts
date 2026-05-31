import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  const mockDate = new Date();

  const mockUserWithRole = {
    id: 'user-id',
    name: 'Test User',
    email: 'test@test.com',
    passwordHash: 'hashed-password',
    roleId: 'role-id',
    isActive: true,
    createdAt: mockDate,
    updatedAt: mockDate,
    role: { id: 'role-id', name: 'staff' },
  };

  const mockUserResponse = {
    id: 'user-id',
    name: 'Test User',
    email: 'test@test.com',
    roleId: 'role-id',
    role: { id: 'role-id', name: 'staff' },
    isActive: true,
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
  };

  const mockUsersRepository = {
    findAll: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated mapped users', async () => {
      repository.findAll.mockResolvedValue([mockUserWithRole]);
      repository.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, 0, 10);
      expect(result).toEqual({
        data: [mockUserResponse],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return mapped user by ID', async () => {
      repository.findById.mockResolvedValue(mockUserWithRole);
      const result = await service.findOne('user-id');
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = { name: 'Test User', email: 'test@test.com', password: 'password', roleId: 'role-id' };

    it('should create and return mapped user', async () => {
      repository.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      repository.create.mockResolvedValue(mockUserWithRole);

      const result = await service.create(createDto);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        roleId: 'role-id',
        passwordHash: 'hashed-password',
      });
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw ConflictException if email exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUserWithRole);
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Name', email: 'new@test.com', password: 'new-password' };

    it('should update and return mapped user', async () => {
      repository.findById.mockResolvedValue(mockUserWithRole);
      repository.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      repository.update.mockResolvedValue({ ...mockUserWithRole, name: 'Updated Name', email: 'new@test.com' });

      await service.update('user-id', updateDto);
      expect(repository.update).toHaveBeenCalledWith('user-id', {
        name: 'Updated Name',
        email: 'new@test.com',
        passwordHash: 'new-hashed-password',
        roleId: undefined,
        isActive: undefined,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update('user-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already in use by another user', async () => {
      repository.findById.mockResolvedValue(mockUserWithRole);
      repository.findByEmail.mockResolvedValue({ id: 'other-id' });
      await expect(service.update('user-id', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      repository.findById.mockResolvedValue(mockUserWithRole);
      await service.remove('user-id');
      expect(repository.softDelete).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.remove('user-id')).rejects.toThrow(NotFoundException);
    });
  });
});
