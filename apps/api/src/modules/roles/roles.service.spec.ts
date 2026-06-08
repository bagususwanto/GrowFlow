import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repository: jest.Mocked<RolesRepository>;

  const mockDate = new Date();
  
  const mockRole = {
    id: 'role-id',
    name: 'custom-role',
    permissions: ['read:items'],
    isActive: true,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockRoleResponse = {
    id: 'role-id',
    name: 'custom-role',
    permissions: ['read:items'],
    isActive: true,
    deletedAt: null,
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
  };

  const mockRepository = {
    findAll: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RolesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get(RolesRepository) as jest.Mocked<RolesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated mapped roles', async () => {
      repository.findAll.mockResolvedValue([[mockRole], 1]);

      const query = { page: 1, limit: 10, search: 'custom-role' };
      const result = await service.findAll(query);
      expect(repository.findAll).toHaveBeenCalledWith(query, 0, 10);
      expect(result.data).toEqual([mockRoleResponse]);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a mapped role', async () => {
      repository.findById.mockResolvedValue(mockRole);
      const result = await service.findOne('role-id');
      expect(result).toEqual(mockRoleResponse);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('role-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = { name: 'custom-role', permissions: [] };

    it('should create and return mapped role', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockRole);

      const result = await service.create(dto);
      expect(result).toEqual(mockRoleResponse);
    });

    it('should throw ConflictException if name exists', async () => {
      repository.findByName.mockResolvedValue(mockRole);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const dto = { name: 'updated-custom-role' };

    it('should update and return mapped role', async () => {
      repository.findById.mockResolvedValue(mockRole);
      repository.findByName.mockResolvedValue(null);
      repository.update.mockResolvedValue({ ...mockRole, name: 'updated-custom-role' });

      const result = await service.update('role-id', dto);
      expect(result.name).toBe('updated-custom-role');
    });

    it('should throw ConflictException if new name already exists', async () => {
      repository.findById.mockResolvedValue(mockRole);
      repository.findByName.mockResolvedValue({ id: 'another-id' } as any);
      await expect(service.update('role-id', dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when trying to rename a built-in system role', async () => {
      const builtInRole = { ...mockRole, name: 'manager' };
      repository.findById.mockResolvedValue(builtInRole);

      await expect(service.update('role-id', { name: 'new-manager-name' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to deactivate a built-in system role', async () => {
      const builtInRole = { ...mockRole, name: 'manager' };
      repository.findById.mockResolvedValue(builtInRole);

      await expect(service.update('role-id', { isActive: false })).rejects.toThrow(BadRequestException);
    });

    it('should allow updating permissions of a built-in system role', async () => {
      const builtInRole = { ...mockRole, name: 'manager' };
      const updatedBuiltInRole = { ...builtInRole, permissions: ['read:items', 'write:items'] };
      repository.findById.mockResolvedValue(builtInRole);
      repository.update.mockResolvedValue(updatedBuiltInRole);

      const result = await service.update('role-id', { permissions: ['read:items', 'write:items'] });
      expect(result.permissions).toEqual(['read:items', 'write:items']);
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      repository.findById.mockResolvedValue(mockRole);
      repository.remove.mockResolvedValue(mockRole);

      await service.remove('role-id');
      expect(repository.remove).toHaveBeenCalledWith('role-id');
    });

    it('should throw BadRequestException on constraint violation', async () => {
      repository.findById.mockResolvedValue(mockRole);
      repository.remove.mockRejectedValue({ code: 'P2003' });

      await expect(service.remove('role-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to delete a built-in system role', async () => {
      const builtInRole = { ...mockRole, name: 'manager' };
      repository.findById.mockResolvedValue(builtInRole);

      await expect(service.remove('role-id')).rejects.toThrow(BadRequestException);
    });
  });
});
