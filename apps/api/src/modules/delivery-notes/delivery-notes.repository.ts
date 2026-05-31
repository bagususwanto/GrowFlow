/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DeliveryNote, Prisma, DeliveryNoteStatus } from '@prisma/client';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { ListDeliveryNotesQueryDto } from './dto/list-delivery-notes-query.dto';

@Injectable()
export class DeliveryNotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListDeliveryNotesQueryDto): Prisma.DeliveryNoteWhereInput {
    const where: Prisma.DeliveryNoteWhereInput = { deletedAt: null };

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

    if (query.salesOrderId) {
      where.salesOrderId = query.salesOrderId;
    }

    if (query.customerId) {
      where.salesOrder = {
        customerId: query.customerId,
      };
    }

    return where;
  }

  async findAll(
    query: ListDeliveryNotesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.deliveryNote.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          salesOrder: {
            select: {
              id: true,
              number: true,
              customerId: true,
              warehouseId: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
              warehouse: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
      this.prisma.deliveryNote.count({ where }),
    ]);

    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.deliveryNote.findFirst({
      where: { id, deletedAt: null },
      include: {
        salesOrder: {
          select: {
            id: true,
            number: true,
            customerId: true,
            warehouseId: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            warehouse: {
              select: {
                id: true,
                name: true,
              },
            },
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
            soLineItem: {
              select: {
                id: true,
                qty: true,
                qtyDelivered: true,
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
    const month = date.getMonth() + 1; // 1-12

    const docSeq = await tx.documentSequence.upsert({
      where: {
        type_year_month: {
          type: 'DN',
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
        type: 'DN',
        year,
        month,
        lastSeq: 1,
      },
    });

    const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
    const paddedMonth = String(month).padStart(2, '0');
    return `DN-${year}${paddedMonth}-${paddedSeq}`;
  }

  async create(
    dto: CreateDeliveryNoteDto,
    userId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<any> {
    const number = await this.generateNumber(tx);

    return tx.deliveryNote.create({
      data: {
        number,
        salesOrderId: dto.salesOrderId,
        note: dto.note,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : new Date(),
        status: DeliveryNoteStatus.DRAFT,
        createdById: userId,
        lineItems: {
          create: dto.lineItems.map((item) => ({
            soLineItemId: item.soLineItemId,
            itemId: item.itemId,
            qty: item.qty,
          })),
        },
      },
      include: {
        salesOrder: {
          select: {
            id: true,
            number: true,
            customerId: true,
            warehouseId: true,
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

  async softDelete(id: string): Promise<DeliveryNote> {
    return this.prisma.deliveryNote.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
