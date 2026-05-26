import { Test, TestingModule } from '@nestjs/testing';
import { ItemsRepository } from './items.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

describe('ItemsRepository', () => {
  let repository: ItemsRepository;
  let prisma: any;

  const mockDate = new Date();
  const mockItem = { id: 'i-id', code: 'ITM1', name: 'Item 1', unit: 'pcs', category: 'Cat', minStock: 10, createdAt: mockDate, updatedAt: mockDate, deletedAt: null };

  const mockPrismaService = {
    item: {
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
        ItemsRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<ItemsRepository>(ItemsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated items', async () => {
      prisma.item.findMany.mockResolvedValue([mockItem]);
      prisma.item.count.mockResolvedValue(1);
      const res = await repository.findAll({ skip: 0, take: 10 });
      expect(res).toEqual([[mockItem], 1]);
    });
  });

  describe('findById', () => {
    it('should find active item by id', async () => {
      prisma.item.findUnique.mockResolvedValue(mockItem);
      const res = await repository.findById('i-id');
      expect(res).toEqual(mockItem);
    });
  });

  describe('findByCode', () => {
    it('should find active item by code', async () => {
      prisma.item.findFirst.mockResolvedValue(mockItem);
      const res = await repository.findByCode('ITM1');
      expect(res).toEqual(mockItem);
    });
  });

  describe('create', () => {
    it('should create item', async () => {
      prisma.item.create.mockResolvedValue(mockItem);
      const res = await repository.create({ code: 'ITM1', name: 'Item 1', unit: 'pcs' });
      expect(res).toEqual(mockItem);
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      prisma.item.update.mockResolvedValue(mockItem);
      const res = await repository.update('i-id', { name: 'Item 2' });
      expect(res).toEqual(mockItem);
    });
  });

  describe('softDelete', () => {
    it('should soft delete item', async () => {
      prisma.item.update.mockResolvedValue({ ...mockItem, deletedAt: new Date() });
      await repository.softDelete('i-id');
      expect(prisma.item.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'i-id' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });
  });
});
