/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PurchaseOrder, Prisma, PurchaseOrderStatus } from '@prisma/client';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ListPurchaseOrdersQueryDto } from './dto/list-purchase-orders-query.dto';

@Injectable()
export class PurchaseOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListPurchaseOrdersQueryDto): Prisma.PurchaseOrderWhereInput {
    const where: Prisma.PurchaseOrderWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { note: { contains: query.search, mode: 'insensitive' } },
        {
          supplier: {
            name: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    return where;
  }

  async findAll(
    query: ListPurchaseOrdersQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        approvedBy: {
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

  async generateNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    // Gunakan transaction untuk memastikan sequence terupdate secara safe
    return this.prisma.$transaction(async (tx) => {
      const docSeq = await tx.documentSequence.upsert({
        where: {
          type_year_month: {
            type: 'PO',
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
          type: 'PO',
          year,
          month,
          lastSeq: 1,
        },
      });

      const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
      const paddedMonth = String(month).padStart(2, '0');
      return `PO-${year}${paddedMonth}-${paddedSeq}`;
    });
  }

  async create(
    dto: CreatePurchaseOrderDto,
    userId: string,
  ): Promise<any> {
    const number = await this.generateNumber();

    return this.prisma.purchaseOrder.create({
      data: {
        number,
        supplierId: dto.supplierId,
        note: dto.note,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
        status: PurchaseOrderStatus.DRAFT,
        createdById: userId,
        totalAmount: dto.lineItems.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0),
        lineItems: {
          create: dto.lineItems.map((item) => ({
            itemId: item.itemId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            totalPrice: item.qty * item.unitPrice,
          })),
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
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

  async update(
    id: string,
    dto: UpdatePurchaseOrderDto,
  ): Promise<any> {
    // Jalankan update PO & line items dalam transaction
    return this.prisma.$transaction(async (tx) => {
      // Jika lineItems dikirim, hapus yang lama dan insert yang baru
      if (dto.lineItems) {
        await tx.purchaseOrderLineItem.deleteMany({
          where: { purchaseOrderId: id },
        });

        const totalAmount = dto.lineItems.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);

        await tx.purchaseOrder.update({
          where: { id },
          data: {
            supplierId: dto.supplierId,
            note: dto.note,
            orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
            totalAmount,
            lineItems: {
              create: dto.lineItems.map((item) => ({
                itemId: item.itemId,
                qty: item.qty,
                unitPrice: item.unitPrice,
                totalPrice: item.qty * item.unitPrice,
              })),
            },
          },
        });
      } else {
        await tx.purchaseOrder.update({
          where: { id },
          data: {
            supplierId: dto.supplierId,
            note: dto.note,
            orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          },
        });
      }

      return tx.purchaseOrder.findUnique({
        where: { id },
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
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
    });
  }

  async updateStatus(
    id: string,
    status: PurchaseOrderStatus,
    extraData: Prisma.PurchaseOrderUncheckedUpdateInput = {},
  ): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        ...extraData,
      },
    });
  }

  async softDelete(id: string): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
