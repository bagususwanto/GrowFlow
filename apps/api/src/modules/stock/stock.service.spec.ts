import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { StockRepository } from './stock.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StockService', () => {
  let service: StockService;
  let repository: any;

  const mockDate = new Date();
  const mockBalance = { id: 'b-id', itemId: 'i-id', warehouseId: 'w-id', qty: 10, createdAt: mockDate, updatedAt: mockDate };
  const mockMutation = { id: 'm-id', qty: 5, type: 'ADJUSTMENT', itemId: 'i-id', warehouseId: 'w-id', note: null, referenceId: null, referenceType: null, createdById: 'u-id', createdAt: mockDate };
  
  const mockBalanceResponse = { ...mockBalance, createdAt: mockDate.toISOString(), updatedAt: mockDate.toISOString() };
  const mockMutationResponse = { ...mockMutation, createdAt: mockDate.toISOString() };

  const mockRepository = {
    findBalance: jest.fn(),
    adjustStock: jest.fn(),
    findMutations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: StockRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    repository = module.get<StockRepository>(StockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return mapped balance', async () => {
      repository.findBalance.mockResolvedValue(mockBalance);
      const res = await service.getBalance('i-id', 'w-id');
      expect(res).toEqual(mockBalanceResponse);
    });

    it('should throw NotFoundException if balance not found', async () => {
      repository.findBalance.mockResolvedValue(null);
      await expect(service.getBalance('i-id', 'w-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustStock', () => {
    it('should adjust stock and return mapped data', async () => {
      repository.adjustStock.mockResolvedValue({ balance: mockBalance, mutation: mockMutation });
      const res = await service.adjustStock({ itemId: 'i-id', warehouseId: 'w-id', qty: 5 }, 'u-id');
      expect(res).toEqual({ balance: mockBalanceResponse, mutation: mockMutationResponse });
    });

    it('should throw BadRequestException if qty is 0', async () => {
      await expect(service.adjustStock({ itemId: 'i-id', warehouseId: 'w-id', qty: 0 }, 'u-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('listMutations', () => {
    it('should list mapped mutations', async () => {
      repository.findMutations.mockResolvedValue([[mockMutation], 1]);
      const res = await service.listMutations({ page: 1, limit: 10, itemId: 'i-id' });
      expect(res).toEqual({ data: [mockMutationResponse], total: 1, page: 1, limit: 10 });
    });
  });
});
