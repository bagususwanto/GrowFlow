import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { GoodsReceipt, Prisma, GoodsReceiptStatus } from '@prisma/client';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { ListGoodsReceiptsQueryDto } from './dto/list-goods-receipts-query.dto';

@Injectable()
export class GoodsReceiptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListGoodsReceiptsQueryDto): Prisma.GoodsReceiptWhereInput {
    const where: Prisma.GoodsReceiptWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { note: { contains: query.search, mode: 'insensitive' } },
        {
          purchaseOrder: {
            number: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.purchaseOrderId) {
      where.purchaseOrderId = query.purchaseOrderId;
    }

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    return where;
  }

  async findAll(
    query: ListGoodsReceiptsQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          purchaseOrder: {
            select: {
              id: true,
              number: true,
              supplierId: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.goodsReceipt.findFirst({
      where: { id, deletedAt: null },
      include: {
        purchaseOrder: {
          select: {
            id: true,
            number: true,
            supplierId: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
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
            poLineItem: {
              select: {
                id: true,
                qty: true,
                qtyReceived: true,
                unitPrice: true,
              },
            },
          },
        },
      },
    });
  }

  async generateNumber(tx: Prisma.TransactionClient = this.prisma): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const docSeq = await tx.documentSequence.upsert({
      where: {
        type_year_month: {
          type: 'GRN',
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
        type: 'GRN',
        year,
        month,
        lastSeq: 1,
      },
    });

    const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
    const paddedMonth = String(month).padStart(2, '0');
    return `GRN-${year}${paddedMonth}-${paddedSeq}`;
  }

  async create(
    dto: CreateGoodsReceiptDto,
    userId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<any> {
    const number = await this.generateNumber(tx);

    return tx.goodsReceipt.create({
      data: {
        number,
        purchaseOrderId: dto.purchaseOrderId,
        warehouseId: dto.warehouseId,
        note: dto.note,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : new Date(),
        status: GoodsReceiptStatus.DRAFT,
        createdById: userId,
        lineItems: {
          create: dto.lineItems.map((item) => ({
            poLineItemId: item.poLineItemId,
            itemId: item.itemId,
            qty: item.qty,
          })),
        },
      },
      include: {
        purchaseOrder: {
          select: {
            id: true,
            number: true,
            supplierId: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
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
      },
    });
  }

  async updateStatus(
    id: string,
    status: GoodsReceiptStatus,
  ): Promise<GoodsReceipt> {
    return this.prisma.goodsReceipt.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string): Promise<GoodsReceipt> {
    return this.prisma.goodsReceipt.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
