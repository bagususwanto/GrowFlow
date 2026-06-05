import { Test, TestingModule } from '@nestjs/testing';
import { SalesInvoicesService } from './sales-invoices.service';
import { SalesInvoicesRepository } from './sales-invoices.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JournalEntriesService } from '../accounting/journal-entries/journal-entries.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesInvoiceStatus, SalesOrderStatus, SalesCreditNoteStatus } from '@prisma/client';

describe('SalesInvoicesService', () => {
  let service: SalesInvoicesService;
  let repository: jest.Mocked<SalesInvoicesRepository>;
  let prisma: jest.Mocked<PrismaService>;

  const mockDate = new Date('2026-06-01T12:00:00.000Z');

  const mockInvoiceDb = {
    id: 'inv-id-1',
    number: 'INV-202606-0001',
    salesOrderId: 'so-id-1',
    customerId: 'customer-id',
    status: SalesInvoiceStatus.DRAFT,
    invoiceDate: mockDate,
    dueDate: mockDate,
    paymentTermsDays: 30,
    totalAmount: '150.00',
    paidAmount: '0.00',
    note: 'Test note',
    sentAt: null,
    createdById: 'user-id',
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    customer: { id: 'customer-id', code: 'CUST-0001', name: 'Test Customer' },
    salesOrder: { id: 'so-id-1', number: 'SO-202606-0001' },
    lineItems: [
      {
        id: 'li-id-1',
        salesInvoiceId: 'inv-id-1',
        soLineItemId: 'so-li-1',
        itemId: 'item-id',
        qty: 10,
        unitPrice: '15.00',
        totalPrice: '150.00',
        item: { id: 'item-id', code: 'ITEM-0001', name: 'Test Item', unit: 'Pcs' },
      },
    ],
    payments: [],
    creditNotes: [],
  };

  beforeEach(async () => {
    mockInvoiceDb.payments = [];
    mockInvoiceDb.creditNotes = [];
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      generateCNNumber: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockPrisma: any = {
      $transaction: jest.fn((cb: any) => cb(mockPrisma)),
      salesInvoicePayment: { create: jest.fn().mockResolvedValue({ id: 'payment-id' }) },
      salesInvoice: { update: jest.fn() },
      salesOrder: { update: jest.fn() },
      salesCreditNote: { create: jest.fn() },
      accountingSettings: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'default',
          apAccountId: 'ap-acc',
          arAccountId: 'ar-acc',
          cashAccountId: 'cash-acc',
          inventoryAccountId: 'inv-acc',
          cogsAccountId: 'cogs-acc',
          revenueAccountId: 'rev-acc',
          purchaseAccountId: 'pur-acc',
        }),
      },
    };

    const mockJournalEntriesService = {
      createAutoJournal: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesInvoicesService,
        { provide: SalesInvoicesRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JournalEntriesService, useValue: mockJournalEntriesService },
      ],
    }).compile();

    service = module.get<SalesInvoicesService>(SalesInvoicesService);
    repository = module.get(SalesInvoicesRepository) as jest.Mocked<SalesInvoicesRepository>;
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send a DRAFT invoice', async () => {
      repository.findById
        .mockResolvedValueOnce(mockInvoiceDb)
        .mockResolvedValueOnce({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT, sentAt: mockDate });

      const result = await service.send('inv-id-1');

      expect(result.status).toBe(SalesInvoiceStatus.SENT);
      expect(prisma.salesInvoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-id-1' },
        data: {
          status: SalesInvoiceStatus.SENT,
          sentAt: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException if invoice is not DRAFT', async () => {
      repository.findById.mockResolvedValue({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT });

      await expect(service.send('inv-id-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordPayment', () => {
    it('should record partial payment and set status to PARTIAL', async () => {
      repository.findById
        .mockResolvedValueOnce({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT })
        .mockResolvedValueOnce({
          ...mockInvoiceDb,
          status: SalesInvoiceStatus.PARTIAL,
          paidAmount: '50.00',
          payments: [{ id: 'p-1', salesInvoiceId: 'inv-id-1', amount: '50.00', paymentDate: mockDate, createdAt: mockDate }],
        });

      const result = await service.recordPayment('inv-id-1', { amount: 50, note: 'Partial Pay' }, 'user-id');

      expect(result.status).toBe(SalesInvoiceStatus.PARTIAL);
      expect(result.paidAmount).toBe(50);
      expect(prisma.salesInvoicePayment.create).toHaveBeenCalled();
    });

    it('should record full payment, set status to PAID, and close Sales Order', async () => {
      repository.findById
        .mockResolvedValueOnce({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT })
        .mockResolvedValueOnce({
          ...mockInvoiceDb,
          status: SalesInvoiceStatus.PAID,
          paidAmount: '150.00',
        });

      const result = await service.recordPayment('inv-id-1', { amount: 150, note: 'Full Pay' }, 'user-id');

      expect(result.status).toBe(SalesInvoiceStatus.PAID);
      expect(prisma.salesOrder.update).toHaveBeenCalledWith({
        where: { id: 'so-id-1' },
        data: { status: SalesOrderStatus.CLOSED },
      });
    });

    it('should throw BadRequestException if payment exceeds outstanding', async () => {
      repository.findById.mockResolvedValue({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT });

      await expect(
        service.recordPayment('inv-id-1', { amount: 200 }, 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCreditNote', () => {
    it('should apply credit note', async () => {
      repository.findById
        .mockResolvedValueOnce({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT })
        .mockResolvedValueOnce({
          ...mockInvoiceDb,
          status: SalesInvoiceStatus.SENT,
          creditNotes: [{ id: 'cn-1', number: 'CN-1', status: SalesCreditNoteStatus.APPLIED, amount: '30.00', createdAt: mockDate }],
        });

      repository.generateCNNumber.mockResolvedValue('CN-202606-0001');

      const result = await service.createCreditNote('inv-id-1', { amount: 30, reason: 'Defective goods return' }, 'user-id');

      expect(prisma.salesCreditNote.create).toHaveBeenCalled();
      expect(result.creditNotes.length).toBe(1);
    });

    it('should throw BadRequestException if credit note amount exceeds outstanding', async () => {
      repository.findById.mockResolvedValue({ ...mockInvoiceDb, status: SalesInvoiceStatus.SENT });

      await expect(
        service.createCreditNote('inv-id-1', { amount: 200, reason: 'Overlimit CN' }, 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel invoice if unpaid', async () => {
      repository.findById
        .mockResolvedValueOnce(mockInvoiceDb)
        .mockResolvedValueOnce({ ...mockInvoiceDb, status: SalesInvoiceStatus.CANCELLED });

      const result = await service.cancel('inv-id-1');

      expect(result.status).toBe(SalesInvoiceStatus.CANCELLED);
      expect(repository.updateStatus).toHaveBeenCalledWith('inv-id-1', SalesInvoiceStatus.CANCELLED);
    });

    it('should throw BadRequestException if invoice has payments', async () => {
      repository.findById.mockResolvedValue({ ...mockInvoiceDb, paidAmount: '50.00' });

      await expect(service.cancel('inv-id-1')).rejects.toThrow(BadRequestException);
    });
  });
});
