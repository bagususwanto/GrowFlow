import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VendorInvoice, VendorInvoicePayment, Prisma } from '@prisma/client';
import { ListVendorInvoicesQueryDto } from './dto/list-vendor-invoices-query.dto';

@Injectable()
export class VendorInvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: ListVendorInvoicesQueryDto): Prisma.VendorInvoiceWhereInput {
    const where: Prisma.VendorInvoiceWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { note: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.startDate || query.endDate) {
      where.invoiceDate = {};
      if (query.startDate) {
        where.invoiceDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.invoiceDate.lte = new Date(query.endDate);
      }
    }

    return where;
  }

  async findAll(
    query: ListVendorInvoicesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const [data, total] = await Promise.all([
      this.prisma.vendorInvoice.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          goodsReceipt: {
            select: {
              id: true,
              number: true,
            },
          },
          purchaseOrder: {
            select: {
              id: true,
              number: true,
            },
          },
        },
      }),
      this.prisma.vendorInvoice.count({ where }),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.vendorInvoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        goodsReceipt: {
          select: {
            id: true,
            number: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            number: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  async findByGoodsReceiptId(goodsReceiptId: string): Promise<VendorInvoice | null> {
    return this.prisma.vendorInvoice.findUnique({
      where: { goodsReceiptId },
    });
  }

  async create(
    data: Prisma.VendorInvoiceUncheckedCreateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<VendorInvoice> {
    return tx.vendorInvoice.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.VendorInvoiceUncheckedUpdateInput,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<VendorInvoice> {
    return tx.vendorInvoice.update({
      where: { id },
      data,
    });
  }
}
