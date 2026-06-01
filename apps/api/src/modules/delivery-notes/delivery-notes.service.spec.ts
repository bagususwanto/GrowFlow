import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryNotesService } from './delivery-notes.service';
import { DeliveryNotesRepository } from './delivery-notes.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { DeliveryNoteStatus, SalesOrderStatus, MutationType } from '@prisma/client';

describe('DeliveryNotesService', () => {
  let service: DeliveryNotesService;
  let repository: jest.Mocked<DeliveryNotesRepository>;
  let prisma: any;

  const mockDate = new Date('2026-06-01T12:00:00.000Z');

  const mockDn = {
    id: 'dn-1',
    number: 'DN-202606-0001',
    salesOrderId: 'so-1',
    status: DeliveryNoteStatus.DRAFT,
    deliveryDate: mockDate,
    note: 'Test note',
    createdById: 'user-1',
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    salesOrder: {
      id: 'so-1',
      number: 'SO-202606-0001',
      customerId: 'customer-1',
      warehouseId: 'wh-1',
    },
    createdBy: {
      id: 'user-1',
      name: 'User One',
    },
    lineItems: [
      {
        id: 'dn-li-1',
        deliveryNoteId: 'dn-1',
        soLineItemId: 'so-li-1',
        itemId: 'item-1',
        qty: 5,
        createdAt: mockDate,
        updatedAt: mockDate,
        item: {
          id: 'item-1',
          code: 'ITEM-01',
          name: 'Item One',
          unit: 'Pcs',
        },
        soLineItem: {
          id: 'so-li-1',
          qty: 10,
          qtyDelivered: 0,
          unitPrice: '100.00',
        },
      },
    ],
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockPrisma: any = {
      salesOrder: { findFirst: jest.fn(), update: jest.fn() },
      stockBalance: { findMany: jest.fn(), update: jest.fn() },
      salesOrderLineItem: { findMany: jest.fn(), update: jest.fn() },
      deliveryNote: { update: jest.fn() },
      stockMutation: { create: jest.fn() },
      $transaction: jest.fn((cb: any) => cb(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryNotesService,
        { provide: DeliveryNotesRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DeliveryNotesService>(DeliveryNotesService);
    repository = module.get(DeliveryNotesRepository) as jest.Mocked<DeliveryNotesRepository>;
    prisma = module.get(PrismaService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of delivery notes', async () => {
      repository.findAll.mockResolvedValue([[mockDn], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe('dn-1');
    });
  });

  describe('findOne', () => {
    it('should return delivery note if found', async () => {
      repository.findById.mockResolvedValue(mockDn);

      const result = await service.findOne('dn-1');

      expect(result.id).toBe('dn-1');
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('dn-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create delivery note successfully if inputs and stock are valid', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue({
        id: 'so-1',
        status: SalesOrderStatus.CONFIRMED,
        warehouseId: 'wh-1',
        lineItems: [
          { id: 'so-li-1', itemId: 'item-1', qty: 10, qtyDelivered: 0 },
        ],
      } as any);

      prisma.stockBalance.findMany.mockResolvedValue([
        { itemId: 'item-1', warehouseId: 'wh-1', qty: 10 },
      ] as any);

      repository.create.mockResolvedValue(mockDn);

      const result = await service.create({
        salesOrderId: 'so-1',
        note: 'Test note',
        deliveryDate: mockDate.toISOString(),
        lineItems: [
          { soLineItemId: 'so-li-1', itemId: 'item-1', qty: 5 },
        ],
      }, 'user-1');

      expect(result.id).toBe('dn-1');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if SO not found', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          salesOrderId: 'so-1',
          note: 'Test note',
          deliveryDate: mockDate.toISOString(),
          lineItems: [
            { soLineItemId: 'so-li-1', itemId: 'item-1', qty: 5 },
          ],
        }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnprocessableEntityException if qty exceeds remaining SO qty', async () => {
      prisma.salesOrder.findFirst.mockResolvedValue({
        id: 'so-1',
        status: SalesOrderStatus.CONFIRMED,
        warehouseId: 'wh-1',
        lineItems: [
          { id: 'so-li-1', itemId: 'item-1', qty: 10, qtyDelivered: 8 },
        ],
      } as any);

      prisma.stockBalance.findMany.mockResolvedValue([
        { itemId: 'item-1', warehouseId: 'wh-1', qty: 10 },
      ] as any);

      await expect(
        service.create({
          salesOrderId: 'so-1',
          note: 'Test note',
          deliveryDate: mockDate.toISOString(),
          lineItems: [
            { soLineItemId: 'so-li-1', itemId: 'item-1', qty: 5 }, // 5 > (10 - 8)
          ],
        }, 'user-1'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('confirm', () => {
    it('should confirm delivery note and update stock/SO status', async () => {
      repository.findById.mockResolvedValue(mockDn);
      prisma.salesOrder.findFirst.mockResolvedValue({
        id: 'so-1',
        status: SalesOrderStatus.CONFIRMED,
        warehouseId: 'wh-1',
        lineItems: [
          { id: 'so-li-1', itemId: 'item-1', qty: 10, qtyDelivered: 0 },
        ],
      } as any);

      prisma.stockBalance.findMany.mockResolvedValue([
        { itemId: 'item-1', warehouseId: 'wh-1', qty: 10 },
      ] as any);

      prisma.salesOrderLineItem.findMany.mockResolvedValue([
        { id: 'so-li-1', qty: 10, qtyDelivered: 5 },
      ] as any);

      const result = await service.confirm('dn-1', 'user-1');

      expect(result.id).toBe('dn-1');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove DRAFT delivery note', async () => {
      repository.findById.mockResolvedValue(mockDn);
      repository.softDelete.mockResolvedValue(mockDn as any);

      await service.remove('dn-1');

      expect(repository.softDelete).toHaveBeenCalledWith('dn-1');
    });

    it('should throw BadRequestException if delivery note is not DRAFT', async () => {
      repository.findById.mockResolvedValue({
        ...mockDn,
        status: DeliveryNoteStatus.CONFIRMED,
      });

      await expect(service.remove('dn-1')).rejects.toThrow(BadRequestException);
    });
  });
});
