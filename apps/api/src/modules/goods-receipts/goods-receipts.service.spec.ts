import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceiptsRepository } from './goods-receipts.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { GoodsReceiptStatus, PurchaseOrderStatus } from '@prisma/client';

describe('GoodsReceiptsService', () => {
  let service: GoodsReceiptsService;
  let repository: jest.Mocked<GoodsReceiptsRepository>;
  let prisma: any;

  const mockDate = new Date('2026-05-30T12:00:00.000Z');

  const mockGrDb = {
    id: 'gr-id-1',
    number: 'GRN-202605-0001',
    purchaseOrderId: 'po-id-1',
    warehouseId: 'warehouse-id',
    status: GoodsReceiptStatus.DRAFT,
    receivedDate: mockDate,
    note: 'Test note',
    createdById: 'user-id',
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    purchaseOrder: { id: 'po-id-1', number: 'PO-202605-0001', supplierId: 'supplier-id' },
    warehouse: { id: 'warehouse-id', name: 'Gudang Utama' },
    createdBy: { id: 'user-id', name: 'Warehouse Staff' },
    lineItems: [
      {
        id: 'gr-li-id-1',
        goodsReceiptId: 'gr-id-1',
        poLineItemId: 'po-li-id-1',
        itemId: 'item-id-1',
        qty: 5,
        createdAt: mockDate,
        updatedAt: mockDate,
        item: { id: 'item-id-1', code: 'ITEM-0001', name: 'Test Item 1', unit: 'Pcs' },
        poLineItem: { id: 'po-li-id-1', qty: 10, qtyReceived: 0, unitPrice: '10.00' },
      },
    ],
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockPrisma: any = {
      purchaseOrder: { findFirst: jest.fn(), update: jest.fn() },
      warehouse: { findFirst: jest.fn() },
      purchaseOrderLineItem: { findMany: jest.fn(), update: jest.fn() },
      $transaction: jest.fn((cb: any) => cb(mockPrisma)),
      goodsReceipt: { update: jest.fn() },
      stockMutation: { create: jest.fn() },
      stockBalance: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoodsReceiptsService,
        { provide: GoodsReceiptsRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GoodsReceiptsService>(GoodsReceiptsService);
    repository = module.get(GoodsReceiptsRepository) as any;
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a GRN if PO status is APPROVED and qty is within limits', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue({
        id: 'po-id-1',
        status: PurchaseOrderStatus.APPROVED,
        lineItems: [{ id: 'po-li-id-1', itemId: 'item-id-1', qty: 10, qtyReceived: 0 }],
      } as any);

      prisma.warehouse.findFirst.mockResolvedValue({ id: 'warehouse-id', isActive: true } as any);
      repository.create.mockResolvedValue(mockGrDb);

      const result = await service.create(
        {
          purchaseOrderId: 'po-id-1',
          warehouseId: 'warehouse-id',
          lineItems: [{ poLineItemId: 'po-li-id-1', itemId: 'item-id-1', qty: 5 }],
        },
        'user-id',
      );

      expect(result.id).toBe('gr-id-1');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if receiving more than remaining qty', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue({
        id: 'po-id-1',
        status: PurchaseOrderStatus.APPROVED,
        lineItems: [{ id: 'po-li-id-1', itemId: 'item-id-1', qty: 10, qtyReceived: 6 }],
      } as any);

      prisma.warehouse.findFirst.mockResolvedValue({ id: 'warehouse-id', isActive: true } as any);

      await expect(
        service.create(
          {
            purchaseOrderId: 'po-id-1',
            warehouseId: 'warehouse-id',
            lineItems: [{ poLineItemId: 'po-li-id-1', itemId: 'item-id-1', qty: 5 }], // remaining is 4
          },
          'user-id',
        ),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('confirm', () => {
    it('should confirm a DRAFT Goods Receipt and update stock', async () => {
      repository.findById.mockResolvedValueOnce(mockGrDb).mockResolvedValueOnce({ ...mockGrDb, status: GoodsReceiptStatus.CONFIRMED });
      prisma.purchaseOrder.findFirst.mockResolvedValue({
        id: 'po-id-1',
        lineItems: [{ id: 'po-li-id-1', itemId: 'item-id-1', qty: 10, qtyReceived: 0 }],
      } as any);
      prisma.purchaseOrderLineItem.findMany.mockResolvedValue([
        { id: 'po-li-id-1', qty: 10, qtyReceived: 5 },
      ] as any);

      const result = await service.confirm('gr-id-1', 'user-id');

      expect(result.status).toBe(GoodsReceiptStatus.CONFIRMED);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
