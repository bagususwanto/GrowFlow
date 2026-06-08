import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VendorInvoicesRepository } from './vendor-invoices.repository';
import { ListVendorInvoicesQueryDto } from './dto/list-vendor-invoices-query.dto';
import { ReceiveVendorInvoiceDto } from './dto/receive-vendor-invoice.dto';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { JournalEntriesService } from '../accounting/journal-entries/journal-entries.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VendorInvoiceStatus, Prisma, VendorInvoicePayment } from '@prisma/client';
import { PaginatedResponse } from '@growflow/types';
import { VendorInvoiceDetails, VendorInvoiceWithDetails } from './vendor-invoices.repository';

export interface VendorInvoiceResponse {
  id: string;
  number: string;
  goodsReceiptId: string | null;
  purchaseOrderId: string | null;
  supplierId: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  paymentTermsDays: number;
  totalAmount: number;
  paidAmount: number;
  note: string | null;
  receivedAt: string | null;
  receivedById: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: string;
    code: string;
    name: string;
  };
  goodsReceipt: {
    id: string;
    number: string;
  } | null;
  purchaseOrder: {
    id: string;
    number: string;
  } | null;
  payments: {
    id: string;
    vendorInvoiceId: string;
    amount: number;
    paymentDate: string;
    note: string | null;
    recordedById: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
}

@Injectable()
export class VendorInvoicesService {
  constructor(
    private readonly repository: VendorInvoicesRepository,
    private readonly journalEntriesService: JournalEntriesService,
    private readonly prisma: PrismaService,
  ) {}

  private mapToResponse(vi: VendorInvoiceDetails | VendorInvoiceWithDetails & { payments?: VendorInvoicePayment[] }): VendorInvoiceResponse {
    return {
      id: vi.id,
      number: vi.number,
      goodsReceiptId: vi.goodsReceiptId,
      purchaseOrderId: vi.purchaseOrderId,
      supplierId: vi.supplierId,
      status: vi.status,
      invoiceDate: vi.invoiceDate.toISOString(),
      dueDate: vi.dueDate.toISOString(),
      paymentTermsDays: vi.paymentTermsDays,
      totalAmount: Number(vi.totalAmount),
      paidAmount: Number(vi.paidAmount),
      note: vi.note,
      receivedAt: vi.receivedAt ? vi.receivedAt.toISOString() : null,
      receivedById: vi.receivedById,
      deletedAt: vi.deletedAt ? vi.deletedAt.toISOString() : null,
      createdAt: vi.createdAt.toISOString(),
      updatedAt: vi.updatedAt.toISOString(),
      supplier: vi.supplier,
      goodsReceipt: vi.goodsReceipt,
      purchaseOrder: vi.purchaseOrder,
      payments: vi.payments ? vi.payments.map((p) => ({
        id: p.id,
        vendorInvoiceId: p.vendorInvoiceId,
        amount: Number(p.amount),
        paymentDate: p.paymentDate.toISOString(),
        note: p.note,
        recordedById: p.recordedById,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })) : [],
    };
  }

  async findAll(query: ListVendorInvoicesQueryDto): Promise<PaginatedResponse<VendorInvoiceResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [invoices, total] = await this.repository.findAll(query, skip, limit);

    return {
      data: invoices.map((vi) => this.mapToResponse(vi)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<VendorInvoiceResponse> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Vendor Invoice with ID ${id} not found`);
    }
    return this.mapToResponse(invoice);
  }

  async receive(id: string, dto: ReceiveVendorInvoiceDto, userId: string): Promise<VendorInvoiceResponse> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Vendor Invoice with ID ${id} not found`);
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(`Only DRAFT invoices can be received. Current status: ${invoice.status}`);
    }

    const settings = await this.prisma.accountingSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new BadRequestException('Accounting Settings default COA mapping is not configured.');
    }

    const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : invoice.invoiceDate;
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : invoice.dueDate;
    const note = dto.note !== undefined ? dto.note : invoice.note;

    await this.prisma.$transaction(async (tx) => {
      // 1. Update Invoice status & metadata
      await tx.vendorInvoice.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          invoiceDate,
          dueDate,
          note,
          receivedAt: new Date(),
          receivedById: userId,
        },
      });

      // 2. Generate Journal Entry automatically
      await this.journalEntriesService.createAutoJournal(
        {
          entryDate: invoiceDate,
          description: `Auto Journal for Vendor Bill ${invoice.number}`,
          sourceType: 'VENDOR_INVOICE',
          sourceId: invoice.id,
          lines: [
            {
              accountId: settings.purchaseAccountId,
              debit: Number(invoice.totalAmount),
              credit: 0,
              description: `Beban Pembelian - Bill ${invoice.number}`,
            },
            {
              accountId: settings.apAccountId,
              debit: 0,
              credit: Number(invoice.totalAmount),
              description: `Hutang Dagang - Bill ${invoice.number}`,
            },
          ],
        },
        tx,
      );
    });

    return this.findOne(id);
  }

  async recordPayment(id: string, dto: CreateVendorPaymentDto, userId: string): Promise<VendorInvoiceResponse> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Vendor Invoice with ID ${id} not found`);
    }

    if (invoice.status !== 'RECEIVED' && invoice.status !== 'PARTIAL') {
      throw new BadRequestException(`Payments can only be recorded on RECEIVED or PARTIAL bills. Current status: ${invoice.status}`);
    }

    const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);
    if (dto.amount > outstanding) {
      throw new BadRequestException(`Payment amount (${dto.amount}) exceeds outstanding amount (${outstanding})`);
    }

    const settings = await this.prisma.accountingSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new BadRequestException('Accounting Settings default COA mapping is not configured.');
    }

    const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();

    await this.prisma.$transaction(async (tx) => {
      // 1. Create payment record
      const payment = await tx.vendorInvoicePayment.create({
        data: {
          vendorInvoiceId: id,
          amount: new Prisma.Decimal(dto.amount),
          paymentDate,
          note: dto.note || null,
          recordedById: userId,
        },
      });

      // 2. Update paidAmount and status
      const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
      const newStatus = Math.abs(newPaidAmount - Number(invoice.totalAmount)) < 0.01 ? 'PAID' : 'PARTIAL';

      await tx.vendorInvoice.update({
        where: { id },
        data: {
          paidAmount: new Prisma.Decimal(newPaidAmount),
          status: newStatus as VendorInvoiceStatus,
        },
      });

      // 3. Post double-entry journal entry
      await this.journalEntriesService.createAutoJournal(
        {
          entryDate: paymentDate,
          description: `Auto Journal for AP Payment on Bill ${invoice.number}`,
          sourceType: 'VENDOR_PAYMENT',
          sourceId: payment.id,
          lines: [
            {
              accountId: settings.apAccountId,
              debit: dto.amount,
              credit: 0,
              description: `Pelunasan Hutang - Bill ${invoice.number}`,
            },
            {
              accountId: settings.cashAccountId,
              debit: 0,
              credit: dto.amount,
              description: `Kas/Bank Pembayaran - Bill ${invoice.number}`,
            },
          ],
        },
        tx,
      );
    });

    return this.findOne(id);
  }

  async cancel(id: string): Promise<VendorInvoiceResponse> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Vendor Invoice with ID ${id} not found`);
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(`Only DRAFT invoices can be cancelled. Current status: ${invoice.status}`);
    }

    await this.repository.update(id, { status: 'CANCELLED' });
    return this.findOne(id);
  }
}
