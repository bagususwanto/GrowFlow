import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersRepository } from './purchase-orders.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let repository: jest.Mocked<PurchaseOrdersRepository>;
  let prisma: jest.Mocked<PrismaService>;

  const mockDate = new Date('2026-05-30T12:00:00.000Z');

  const mockPoDb = {
    id: 'po-id-1',
    number: 'PO-202605-0001',
    supplierId: 'supplier-id',
    status: PurchaseOrderStatus.DRAFT,
    note: 'Test note',
    totalAmount: '150.00',
    orderDate: mockDate,
    createdById: 'user-id',
    approvedById: null,
    approvedAt: null,
    cancelledAt: null,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    supplier: { id: 'supplier-id', code: 'SUP-0001', name: 'Test Supplier' },
    createdBy: { id: 'user-id', name: 'Staff' },
    approvedBy: null,
    lineItems: [
      {
        id: 'li-id-1',
        purchaseOrderId: 'po-id-1',
        itemId: 'item-id',
        qty: 10,
        unitPrice: '15.00',
        totalPrice: '150.00',
        qtyReceived: 0,
        createdAt: mockDate,
        updatedAt: mockDate,
        item: { id: 'item-id', code: 'ITEM-0001', name: 'Test Item', unit: 'Pcs' },
      },
    ],
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockPrisma = {
      partner: { findFirst: jest.fn() },
      item: { findFirst: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: PurchaseOrdersRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
    repository = module.get(PurchaseOrdersRepository) as jest.Mocked<PurchaseOrdersRepository>;
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a PO when supplier and items are valid', async () => {
      (prisma.partner.findFirst as jest.Mock).mockResolvedValue({ id: 'supplier-id' } as any);
      (prisma.item.findMany as jest.Mock).mockResolvedValue([{ id: 'item-id' }] as any);
      repository.create.mockResolvedValue(mockPoDb);

      const result = await service.create(
        {
          supplierId: 'supplier-id',
          note: 'Test note',
          lineItems: [{ itemId: 'item-id', qty: 10, unitPrice: 15 }],
        },
        'user-id',
      );

      expect(result.id).toBe('po-id-1');
      expect(result.totalAmount).toBe(150);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if supplier is invalid', async () => {
      (prisma.partner.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(
          {
            supplierId: 'invalid-supplier',
            lineItems: [{ itemId: 'item-id', qty: 10, unitPrice: 15 }],
          },
          'user-id',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a SUBMITTED purchase order', async () => {
      const submittedPo = { ...mockPoDb, status: PurchaseOrderStatus.SUBMITTED };
      repository.findById
        .mockResolvedValueOnce(submittedPo) // Untuk validasi status awal
        .mockResolvedValueOnce({ ...submittedPo, status: PurchaseOrderStatus.APPROVED, approvedById: 'manager-id', approvedAt: mockDate }); // Setelah status update

      await service.approve('po-id-1', 'manager-id');

      expect(repository.updateStatus).toHaveBeenCalledWith('po-id-1', PurchaseOrderStatus.APPROVED, {
        approvedById: 'manager-id',
        approvedAt: expect.any(Date),
      });
    });

    it('should throw BadRequestException if PO is not SUBMITTED', async () => {
      repository.findById.mockResolvedValue(mockPoDb); // DRAFT status

      await expect(
        service.approve('po-id-1', 'manager-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
