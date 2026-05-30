import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceiptStatus } from '@growflow/types';

describe('GoodsReceiptsController', () => {
  let controller: GoodsReceiptsController;
  let service: jest.Mocked<GoodsReceiptsService>;

  const mockUser = {
    id: 'user-id',
    name: 'Warehouse User',
    email: 'warehouse@growflow.com',
    isActive: true,
    role: 'warehouse' as any,
  };

  const mockGrResponse = {
    id: 'gr-id-1',
    number: 'GRN-202605-0001',
    purchaseOrderId: 'po-id-1',
    warehouseId: 'warehouse-id',
    status: 'DRAFT' as GoodsReceiptStatus,
    receivedDate: new Date().toISOString(),
    note: 'Test note',
    createdById: 'user-id',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      confirm: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceiptsController],
      providers: [
        { provide: GoodsReceiptsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<GoodsReceiptsController>(GoodsReceiptsController);
    service = module.get(GoodsReceiptsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = {
        purchaseOrderId: 'po-id-1',
        warehouseId: 'warehouse-id',
        lineItems: [{ poLineItemId: 'po-li-id-1', itemId: 'item-id-1', qty: 5 }],
      };
      service.create.mockResolvedValue(mockGrResponse);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
      expect(result).toEqual(mockGrResponse);
    });
  });

  describe('confirm', () => {
    it('should call service.confirm', async () => {
      service.confirm.mockResolvedValue({ ...mockGrResponse, status: 'CONFIRMED' as GoodsReceiptStatus });

      const result = await controller.confirm('gr-id-1', mockUser);

      expect(service.confirm).toHaveBeenCalledWith('gr-id-1', 'user-id');
      expect(result.status).toBe('CONFIRMED');
    });
  });
});
