import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrderStatus } from '@growflow/types';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;
  let service: jest.Mocked<PurchaseOrdersService>;

  const mockUser = {
    id: 'user-id',
    name: 'Staff User',
    email: 'staff@growflow.com',
    isActive: true,
    role: 'staff' as any,
  };

  const mockPoResponse = {
    id: 'po-id-1',
    number: 'PO-202605-0001',
    supplierId: 'supplier-id',
    status: 'DRAFT' as PurchaseOrderStatus,
    note: 'Test note',
    totalAmount: 150,
    orderDate: new Date().toISOString(),
    createdById: 'user-id',
    approvedById: null,
    approvedAt: null,
    cancelledAt: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      submit: jest.fn(),
      approve: jest.fn(),
      cancel: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [
        { provide: PurchaseOrdersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
    service = module.get(PurchaseOrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto and userId', async () => {
      const dto = {
        supplierId: 'supplier-id',
        lineItems: [{ itemId: 'item-id', qty: 10, unitPrice: 15 }],
      };
      service.create.mockResolvedValue(mockPoResponse);

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
      expect(result).toEqual(mockPoResponse);
    });
  });

  describe('approve', () => {
    it('should call service.approve with PO ID and manager ID', async () => {
      const managerUser = { ...mockUser, id: 'manager-id', role: 'manager' as any };
      service.approve.mockResolvedValue({ ...mockPoResponse, status: 'APPROVED' as PurchaseOrderStatus, approvedById: 'manager-id' });

      const result = await controller.approve('po-id-1', managerUser);

      expect(service.approve).toHaveBeenCalledWith('po-id-1', 'manager-id');
      expect(result.status).toBe('APPROVED');
    });
  });
});
