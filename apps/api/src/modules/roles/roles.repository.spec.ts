import { Test, TestingModule } from '@nestjs/testing';
import { RolesRepository } from './roles.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('RolesRepository', () => {
  let repository: RolesRepository;
  let prisma: any;

  const mockRole = {
    id: 'role-id',
    name: 'staff',
    permissions: ['read:items'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    role: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<RolesRepository>(RolesRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      prisma.role.findMany.mockResolvedValue([mockRole]);
      const result = await repository.findAll(0, 10);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockRole]);
    });
  });

  describe('count', () => {
    it('should return roles count', async () => {
      prisma.role.count.mockResolvedValue(5);
      const result = await repository.count();
      expect(result).toBe(5);
    });
  });

  describe('findById', () => {
    it('should find a role by ID', async () => {
      prisma.role.findUnique.mockResolvedValue(mockRole);
      const result = await repository.findById('role-id');
      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: 'role-id' } });
      expect(result).toEqual(mockRole);
    });
  });

  describe('findByName', () => {
    it('should find a role by name', async () => {
      prisma.role.findUnique.mockResolvedValue(mockRole);
      const result = await repository.findByName('staff');
      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: 'staff' } });
      expect(result).toEqual(mockRole);
    });
  });

  describe('create', () => {
    it('should create a role', async () => {
      prisma.role.create.mockResolvedValue(mockRole);
      const dto = { name: 'staff', permissions: ['read:items'] };
      const result = await repository.create(dto);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      prisma.role.update.mockResolvedValue(mockRole);
      const dto = { name: 'staff-updated' };
      const result = await repository.update('role-id', dto);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'role-id' },
        data: dto,
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('remove', () => {
    it('should delete a role', async () => {
      prisma.role.delete.mockResolvedValue(mockRole);
      const result = await repository.remove('role-id');
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 'role-id' } });
      expect(result).toEqual(mockRole);
    });
  });
});
