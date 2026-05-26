import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesRepository } from './warehouses.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('WarehousesRepository', () => {
  let repository: WarehousesRepository;
  let prisma: any;

  const mockDate = new Date();
  const mockWarehouse = { id: 'w-id', name: 'Main', address: '123', isActive: true, createdAt: mockDate, updatedAt: mockDate, deletedAt: null };

  const mockPrismaService = {
    warehouse: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehousesRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<WarehousesRepository>(WarehousesRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated warehouses', async () => {
      prisma.warehouse.findMany.mockResolvedValue([mockWarehouse]);
      prisma.warehouse.count.mockResolvedValue(1);
      const query = { page: 1, limit: 10, search: 'Main', isActive: true, sortBy: 'name', sortOrder: 'asc' as any };
      const res = await repository.findAll(query, 0, 10);
      expect(res).toEqual([[mockWarehouse], 1]);
      expect(prisma.warehouse.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: null,
          isActive: true,
          OR: [
            { name: { contains: 'Main', mode: 'insensitive' } },
            { address: { contains: 'Main', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should find active warehouse by id', async () => {
      prisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      const res = await repository.findById('w-id');
      expect(res).toEqual(mockWarehouse);
    });
  });

  describe('findByName', () => {
    it('should find active warehouse by name', async () => {
      prisma.warehouse.findFirst.mockResolvedValue(mockWarehouse);
      const res = await repository.findByName('Main');
      expect(res).toEqual(mockWarehouse);
    });
  });

  describe('create', () => {
    it('should create warehouse', async () => {
      prisma.warehouse.create.mockResolvedValue(mockWarehouse);
      const res = await repository.create({ name: 'Main' });
      expect(res).toEqual(mockWarehouse);
    });
  });

  describe('update', () => {
    it('should update warehouse', async () => {
      prisma.warehouse.update.mockResolvedValue(mockWarehouse);
      const res = await repository.update('w-id', { name: 'Main 2' });
      expect(res).toEqual(mockWarehouse);
    });
  });

  describe('softDelete', () => {
    it('should soft delete warehouse', async () => {
      prisma.warehouse.update.mockResolvedValue({ ...mockWarehouse, isActive: false, deletedAt: new Date() });
      await repository.softDelete('w-id');
      expect(prisma.warehouse.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'w-id' },
          data: expect.objectContaining({ isActive: false }),
        })
      );
    });
  });
});
