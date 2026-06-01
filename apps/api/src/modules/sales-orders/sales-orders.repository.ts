/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SalesOrder, Prisma, SalesOrderStatus } from '@prisma/client';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { ListSalesOrdersQueryDto } from './dto/list-sales-orders-query.dto';

@Injectable()
export class SalesOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListSalesOrdersQueryDto): Prisma.SalesOrderWhereInput {
    const where: Prisma.SalesOrderWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { note: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            name: { contains: query.search, mode: 'insensitive' },
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

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    return where;
  }

  async findAll(
    query: ListSalesOrdersQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
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
          confirmedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.salesOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
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
        confirmedBy: {
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
        deliveryNotes: {
          where: { deletedAt: null },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        salesInvoice: {
          select: {
            id: true,
            number: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
    });
  }

  async generateNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12

    return this.prisma.$transaction(async (tx) => {
      const docSeq = await tx.documentSequence.upsert({
        where: {
          type_year_month: {
            type: 'SO',
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
          type: 'SO',
          year,
          month,
          lastSeq: 1,
        },
      });

      const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
      const paddedMonth = String(month).padStart(2, '0');
      return `SO-${year}${paddedMonth}-${paddedSeq}`;
    });
  }

  async create(
    dto: CreateSalesOrderDto,
    userId: string,
  ): Promise<any> {
    const number = await this.generateNumber();

    return this.prisma.salesOrder.create({
      data: {
        number,
        customerId: dto.customerId,
        warehouseId: dto.warehouseId,
        note: dto.note,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
        status: SalesOrderStatus.DRAFT,
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
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
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

  async update(
    id: string,
    dto: UpdateSalesOrderDto,
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.lineItems) {
        await tx.salesOrderLineItem.deleteMany({
          where: { salesOrderId: id },
        });

        const totalAmount = dto.lineItems.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);

        await tx.salesOrder.update({
          where: { id },
          data: {
            customerId: dto.customerId,
            warehouseId: dto.warehouseId,
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
        await tx.salesOrder.update({
          where: { id },
          data: {
            customerId: dto.customerId,
            warehouseId: dto.warehouseId,
            note: dto.note,
            orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          },
        });
      }

      return tx.salesOrder.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              name: true,
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
    });
  }

  async updateStatus(
    id: string,
    status: SalesOrderStatus,
    extraData: Prisma.SalesOrderUncheckedUpdateInput = {},
  ): Promise<SalesOrder> {
    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        status,
        ...extraData,
      },
    });
  }

  async softDelete(id: string): Promise<SalesOrder> {
    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
