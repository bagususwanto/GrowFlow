import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

describe('StockController', () => {
  let controller: StockController;
  let service: any;

  const mockService = {
    getBalance: jest.fn(),
    adjustStock: jest.fn(),
    listMutations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        { provide: StockService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    service = module.get<StockService>(StockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBalance', () => {
    it('should call service getBalance', async () => {
      service.getBalance.mockResolvedValue('balance');
      const res = await controller.getBalance('i-id', 'w-id');
      expect(service.getBalance).toHaveBeenCalledWith('i-id', 'w-id');
      expect(res).toBe('balance');
    });
  });

  describe('adjustStock', () => {
    it('should call service adjustStock', async () => {
      service.adjustStock.mockResolvedValue('adjusted');
      const dto = { itemId: 'i-id', warehouseId: 'w-id', qty: 5 };
      const user = { id: 'u-id' } as any;
      const res = await controller.adjustStock(dto, user);
      expect(service.adjustStock).toHaveBeenCalledWith(dto, 'u-id');
      expect(res).toBe('adjusted');
    });
  });

  describe('listMutations', () => {
    it('should call service listMutations', async () => {
      service.listMutations.mockResolvedValue('mutations');
      const query = { page: 1, limit: 10 };
      const res = await controller.listMutations(query);
      expect(service.listMutations).toHaveBeenCalledWith(query);
      expect(res).toBe('mutations');
    });
  });
});
