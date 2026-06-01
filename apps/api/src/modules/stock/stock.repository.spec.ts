import { Test, TestingModule } from '@nestjs/testing';
import { StockRepository } from './stock.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SortOrder } from '../../common/dto/sort-order.enum';

describe('StockRepository', () => {
  let repository: StockRepository;
  let prisma: any;

  const mockDate = new Date();
  const mockBalance = { id: 'b-id', itemId: 'i-id', warehouseId: 'w-id', qty: 10, createdAt: mockDate, updatedAt: mockDate };
  const mockMutation = { id: 'm-id', qty: 5, type: 'ADJUSTMENT', itemId: 'i-id', warehouseId: 'w-id', note: null, referenceId: null, referenceType: null, createdById: 'u-id', createdAt: mockDate };

  const mockTx = {
    stockBalance: { upsert: jest.fn() },
    stockMutation: { create: jest.fn() },
  };

  const mockPrismaService = {
    stockBalance: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    stockMutation: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockTx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<StockRepository>(StockRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findBalance', () => {
    it('should find balance by item and warehouse', async () => {
      prisma.stockBalance.findUnique.mockResolvedValue(mockBalance);
      const res = await repository.findBalance('i-id', 'w-id');
      expect(prisma.stockBalance.findUnique).toHaveBeenCalledWith({
        where: { itemId_warehouseId: { itemId: 'i-id', warehouseId: 'w-id' } },
      });
      expect(res).toEqual(mockBalance);
    });
  });

  describe('adjustStock', () => {
    it('should upsert balance and create mutation inside transaction', async () => {
      mockTx.stockBalance.upsert.mockResolvedValue(mockBalance);
      mockTx.stockMutation.create.mockResolvedValue(mockMutation);
      const res = await repository.adjustStock('i-id', 'w-id', 5, 'ADJUSTMENT', 'note', 'u-id');
      
      expect(mockTx.stockBalance.upsert).toHaveBeenCalled();
      expect(mockTx.stockMutation.create).toHaveBeenCalled();
      expect(res).toEqual({ balance: mockBalance, mutation: mockMutation });
    });
  });

  describe('findMutations', () => {
    it('should find mutations with pagination, filters, and dynamic sorting', async () => {
      prisma.stockMutation.findMany.mockResolvedValue([mockMutation]);
      prisma.stockMutation.count.mockResolvedValue(1);
      
      const query = { itemId: 'i-id', sortBy: 'qty', sortOrder: SortOrder.ASC };
      const res = await repository.findMutations(query, 0, 10);
      expect(prisma.stockMutation.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { itemId: 'i-id' },
        orderBy: { qty: 'asc' },
        include: {
          item: true,
          warehouse: true,
        },
      });
      expect(prisma.stockMutation.count).toHaveBeenCalledWith({
        where: { itemId: 'i-id' },
      });
      expect(res).toEqual([[mockMutation], 1]);
    });
  });

  describe('findBalances', () => {
    it('should find balances with pagination, filters, and dynamic sorting', async () => {
      prisma.stockBalance.findMany.mockResolvedValue([mockBalance]);
      prisma.stockBalance.count.mockResolvedValue(1);
      
      const query = { itemId: 'i-id', sortBy: 'qty', sortOrder: SortOrder.ASC };
      const res = await repository.findBalances(query, 0, 10);
      expect(prisma.stockBalance.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { itemId: 'i-id' },
        orderBy: { qty: 'asc' },
        include: {
          item: true,
          warehouse: true,
        },
      });
      expect(prisma.stockBalance.count).toHaveBeenCalledWith({
        where: { itemId: 'i-id' },
      });
      expect(res).toEqual([[mockBalance], 1]);
    });
  });
});

