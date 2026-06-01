/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SalesInvoice, Prisma, SalesInvoiceStatus, SalesCreditNoteStatus } from '@prisma/client';
import { ListSalesInvoicesQueryDto } from './dto/list-sales-invoices-query.dto';

@Injectable()
export class SalesInvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListSalesInvoicesQueryDto): Prisma.SalesInvoiceWhereInput {
    const where: Prisma.SalesInvoiceWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { note: { contains: query.search, mode: 'insensitive' } },
        {
          salesOrder: {
            number: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.dateFrom || query.dateTo) {
      where.invoiceDate = {};
      if (query.dateFrom) {
        where.invoiceDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.invoiceDate.lte = new Date(query.dateTo);
      }
    }

    return where;
  }

  async findAll(
    query: ListSalesInvoicesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.salesInvoice.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          salesOrder: {
            select: {
              id: true,
              number: true,
            },
          },
        },
      }),
      this.prisma.salesInvoice.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.salesInvoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        salesOrder: {
          select: {
            id: true,
            number: true,
          },
        },
        lineItems: {
          include: {
            item: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        payments: true,
        creditNotes: true,
      },
    });
  }

  async generateCNNumber(tx: Prisma.TransactionClient = this.prisma): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const docSeq = await tx.documentSequence.upsert({
      where: {
        type_year_month: {
          type: 'CN',
          year,
          month,
        },
      },
      update: {
        lastSeq: {
          increment: 1,
        },
      },
      create: {
        type: 'CN',
        year,
        month,
        lastSeq: 1,
      },
    });

    const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
    const paddedMonth = String(month).padStart(2, '0');
    return `CN-${year}${paddedMonth}-${paddedSeq}`;
  }

  async updateStatus(
    id: string,
    status: SalesInvoiceStatus,
    extraData: Prisma.SalesInvoiceUncheckedUpdateInput = {},
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<SalesInvoice> {
    return tx.salesInvoice.update({
      where: { id },
      data: {
        status,
        ...extraData,
      },
    });
  }

  async softDelete(id: string): Promise<SalesInvoice> {
    return this.prisma.salesInvoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
