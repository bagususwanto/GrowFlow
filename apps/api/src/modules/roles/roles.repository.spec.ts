import { Test, TestingModule } from '@nestjs/testing';
import { RolesRepository } from './roles.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SortOrder } from '../../common/dto/sort-order.enum';

describe('RolesRepository', () => {
  let repository: RolesRepository;
  let prisma: jest.Mocked<PrismaService>;

  const mockRole = {
    id: 'role-id',
    name: 'sales',
    permissions: ['read:items'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    role: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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
    prisma = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated roles with filters and sorting', async () => {
      (prisma.role.findMany as jest.Mock).mockResolvedValue([mockRole]);
      (prisma.role.count as jest.Mock).mockResolvedValue(1);

      const query = { search: 'sales', sortBy: 'name', sortOrder: SortOrder.ASC };
      const result = await repository.findAll(query, 0, 10);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: null,
          name: {
            contains: 'sales',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(prisma.role.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          name: {
            contains: 'sales',
            mode: 'insensitive',
          },
        },
      });
      expect(result).toEqual([[mockRole], 1]);
    });
  });

  describe('findById', () => {
    it('should find a role by ID', async () => {
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(mockRole);
      const result = await repository.findById('role-id');
      expect(prisma.role.findFirst).toHaveBeenCalledWith({ where: { id: 'role-id', deletedAt: null } });
      expect(result).toEqual(mockRole);
    });
  });

  describe('findByName', () => {
    it('should find a role by name', async () => {
      (prisma.role.findFirst as jest.Mock).mockResolvedValue(mockRole);
      const result = await repository.findByName('sales');
      expect(prisma.role.findFirst).toHaveBeenCalledWith({ where: { name: 'sales', deletedAt: null } });
      expect(result).toEqual(mockRole);
    });
  });

  describe('create', () => {
    it('should create a role', async () => {
      (prisma.role.create as jest.Mock).mockResolvedValue(mockRole);
      const dto = { name: 'sales', permissions: ['read:items'] };
      const result = await repository.create(dto);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      (prisma.role.update as jest.Mock).mockResolvedValue(mockRole);
      const dto = { name: 'sales-updated' };
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
      (prisma.role.update as jest.Mock).mockResolvedValue(mockRole);
      const result = await repository.remove('role-id');
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'role-id' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockRole);
    });
  });
});
