import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersRepository } from './sales-orders.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SalesOrderStatus } from '@prisma/client';

describe('SalesOrdersService', () => {
  let service: SalesOrdersService;
  let repository: jest.Mocked<SalesOrdersRepository>;
  let prisma: any;

  const mockDate = new Date('2026-05-30T12:00:00.000Z');

  const mockSoDb = {
    id: 'so-id-1',
    number: 'SO-202605-0001',
    customerId: 'customer-id',
    warehouseId: 'warehouse-id',
    status: SalesOrderStatus.DRAFT,
    note: 'Test note',
    totalAmount: '150.00',
    orderDate: mockDate,
    createdById: 'user-id',
    confirmedById: null,
    confirmedAt: null,
    cancelledAt: null,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    customer: { id: 'customer-id', code: 'CUST-0001', name: 'Test Customer' },
    warehouse: { id: 'warehouse-id', name: 'Main Warehouse' },
    createdBy: { id: 'user-id', name: 'Sales Staff' },
    confirmedBy: null,
    lineItems: [
      {
        id: 'li-id-1',
        salesOrderId: 'so-id-1',
        itemId: 'item-id',
        qty: 10,
        unitPrice: '15.00',
        totalPrice: '150.00',
        qtyDelivered: 0,
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
      warehouse: { findFirst: jest.fn() },
      item: { findFirst: jest.fn() },
      stockBalance: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesOrdersService,
        { provide: SalesOrdersRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SalesOrdersService>(SalesOrdersService);
    repository = module.get(SalesOrdersRepository) as any;
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a SO when customer, warehouse and items are valid', async () => {
      prisma.partner.findFirst.mockResolvedValue({ id: 'customer-id' } as any);
      prisma.warehouse.findFirst.mockResolvedValue({ id: 'warehouse-id' } as any);
      prisma.item.findFirst.mockResolvedValue({ id: 'item-id' } as any);
      repository.create.mockResolvedValue(mockSoDb);

      const result = await service.create(
        {
          customerId: 'customer-id',
          warehouseId: 'warehouse-id',
          note: 'Test note',
          lineItems: [{ itemId: 'item-id', qty: 10, unitPrice: 15 }],
        },
        'user-id',
      );

      expect(result.id).toBe('so-id-1');
      expect(result.totalAmount).toBe(150);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if customer is invalid', async () => {
      prisma.partner.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            customerId: 'invalid-customer',
            warehouseId: 'warehouse-id',
            lineItems: [{ itemId: 'item-id', qty: 10, unitPrice: 15 }],
          },
          'user-id',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirm', () => {
    it('should confirm a DRAFT SO when stock is available', async () => {
      repository.findById
        .mockResolvedValueOnce(mockSoDb)
        .mockResolvedValueOnce({ ...mockSoDb, status: SalesOrderStatus.CONFIRMED, confirmedById: 'user-id', confirmedAt: mockDate });

      prisma.stockBalance.findUnique.mockResolvedValue({ itemId: 'item-id', warehouseId: 'warehouse-id', qty: 20 });

      const result = await service.confirm('so-id-1', 'user-id');

      expect(result.status).toBe(SalesOrderStatus.CONFIRMED);
      expect(repository.updateStatus).toHaveBeenCalledWith('so-id-1', SalesOrderStatus.CONFIRMED, {
        confirmedById: 'user-id',
        confirmedAt: expect.any(Date),
      });
    });

    it('should throw UnprocessableEntityException if stock is insufficient', async () => {
      repository.findById.mockResolvedValue(mockSoDb);
      prisma.stockBalance.findUnique.mockResolvedValue({ itemId: 'item-id', warehouseId: 'warehouse-id', qty: 5 }); // Butuh 10, cuma ada 5

      await expect(
        service.confirm('so-id-1', 'user-id'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
