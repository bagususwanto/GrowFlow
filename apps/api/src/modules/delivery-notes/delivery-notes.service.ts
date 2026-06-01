/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { DeliveryNotesRepository } from './delivery-notes.repository';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { ListDeliveryNotesQueryDto } from './dto/list-delivery-notes-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { DeliveryNoteResponseEntity } from './entities/delivery-note-response.entity';
import { DeliveryNoteStatus, SalesOrderStatus, MutationType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DeliveryNotesService {
  constructor(
    private readonly repository: DeliveryNotesRepository,
    private readonly prisma: PrismaService,
  ) {}

  private mapToResponse(dn: any): DeliveryNoteResponseEntity {
    return {
      id: dn.id,
      number: dn.number,
      salesOrderId: dn.salesOrderId,
      status: dn.status,
      deliveryDate: dn.deliveryDate.toISOString(),
      note: dn.note,
      createdById: dn.createdById,
      deletedAt: dn.deletedAt ? dn.deletedAt.toISOString() : null,
      createdAt: dn.createdAt.toISOString(),
      updatedAt: dn.updatedAt.toISOString(),
      salesOrder: dn.salesOrder,
      createdBy: dn.createdBy,
      lineItems: dn.lineItems?.map((li: any) => ({
        id: li.id,
        deliveryNoteId: li.deliveryNoteId,
        soLineItemId: li.soLineItemId,
        itemId: li.itemId,
        qty: li.qty,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
        item: li.item,
        soLineItem: li.soLineItem ? {
          id: li.soLineItem.id,
          qty: li.soLineItem.qty,
          qtyDelivered: li.soLineItem.qtyDelivered,
          unitPrice: Number(li.soLineItem.unitPrice),
        } : undefined,
      })),
    };
  }

  async findAll(query: ListDeliveryNotesQueryDto): Promise<PaginatedResponse<DeliveryNoteResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [dns, total] = await this.repository.findAll(query, skip, limit);

    return {
      data: dns.map((dn) => this.mapToResponse(dn)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<DeliveryNoteResponseEntity> {
    const dn = await this.repository.findById(id);
    if (!dn) {
      throw new NotFoundException(`Delivery Note with ID ${id} not found`);
    }
    return this.mapToResponse(dn);
  }

  async create(dto: CreateDeliveryNoteDto, userId: string): Promise<DeliveryNoteResponseEntity> {
    // 1. Validasi SO status harus CONFIRMED atau PARTIAL
    const so = await this.prisma.salesOrder.findFirst({
      where: { id: dto.salesOrderId, deletedAt: null },
      include: { lineItems: true },
    });

    if (!so) {
      throw new BadRequestException(`Sales Order with ID ${dto.salesOrderId} not found`);
    }

    if (so.status !== SalesOrderStatus.CONFIRMED && so.status !== SalesOrderStatus.PARTIAL) {
      throw new BadRequestException(`Cannot create Delivery Note for Sales Order with status ${so.status}`);
    }

    // 2. Validasi line items dan ketersediaan stok fisik
    const itemIds = dto.lineItems.map((item) => item.itemId);
    const balances = await this.prisma.stockBalance.findMany({
      where: {
        itemId: { in: itemIds },
        warehouseId: so.warehouseId,
      },
    });

    for (const item of dto.lineItems) {
      const soLine = so.lineItems.find((l) => l.id === item.soLineItemId);
      if (!soLine) {
        throw new BadRequestException(`SO Line Item ${item.soLineItemId} does not belong to SO ${dto.salesOrderId}`);
      }

      if (soLine.itemId !== item.itemId) {
        throw new BadRequestException(`Item ID mismatch on SO Line Item ${item.soLineItemId}`);
      }

      const remaining = soLine.qty - soLine.qtyDelivered;
      if (item.qty > remaining) {
        throw new UnprocessableEntityException(
          `Cannot deliver ${item.qty} units of item ${item.itemId}. Only ${remaining} units remaining on SO.`,
        );
      }

      // Validasi ketersediaan stok fisik di gudang asal dari hasil batch
      const balance = balances.find((b) => b.itemId === item.itemId);
      const availableQty = balance ? balance.qty : 0;
      if (availableQty < item.qty) {
        throw new UnprocessableEntityException(
          `Insufficient physical stock for delivery. Item ID ${item.itemId} only has ${availableQty} units available in the warehouse.`,
        );
      }
    }

    const dn = await this.repository.create(dto, userId);
    return this.mapToResponse(dn);
  }

  async confirm(id: string, userId: string): Promise<DeliveryNoteResponseEntity> {
    const dn = await this.repository.findById(id);
    if (!dn) {
      throw new NotFoundException(`Delivery Note with ID ${id} not found`);
    }

    if (dn.status !== DeliveryNoteStatus.DRAFT) {
      throw new BadRequestException(`Delivery Note is already ${dn.status}`);
    }

    const so = await this.prisma.salesOrder.findFirst({
      where: { id: dn.salesOrderId, deletedAt: null },
      include: { lineItems: true },
    });

    if (!so) {
      throw new BadRequestException(`Sales Order with ID ${dn.salesOrderId} not found`);
    }

    if (so.status !== SalesOrderStatus.CONFIRMED && so.status !== SalesOrderStatus.PARTIAL) {
      throw new BadRequestException(`Cannot confirm Delivery Note for Sales Order with status ${so.status}`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Perform the validation check inside the transaction to prevent TOCTOU race conditions
      const itemIds = dn.lineItems.map((item: any) => item.itemId);
      const balances = await tx.stockBalance.findMany({
        where: {
          itemId: { in: itemIds },
          warehouseId: so.warehouseId,
        },
      });

      for (const item of dn.lineItems) {
        const soLine = so.lineItems.find((l) => l.id === item.soLineItemId);
        if (!soLine) {
          throw new BadRequestException(`SO Line Item ${item.soLineItemId} does not belong to SO ${dn.salesOrderId}`);
        }

        const remaining = soLine.qty - soLine.qtyDelivered;
        if (item.qty > remaining) {
          throw new UnprocessableEntityException(
            `Cannot deliver ${item.qty} units of item ${item.item.name}. Only ${remaining} units remaining on SO.`,
          );
        }

        const balance = balances.find((b) => b.itemId === item.itemId);
        const availableQty = balance ? balance.qty : 0;
        if (availableQty < item.qty) {
          throw new UnprocessableEntityException(
            `Insufficient physical stock for delivery. Item ${item.item.name} only has ${availableQty} units available in the warehouse.`,
          );
        }
      }

      await tx.deliveryNote.update({
        where: { id },
        data: { status: DeliveryNoteStatus.CONFIRMED },
      });

      for (const item of dn.lineItems) {
        await tx.salesOrderLineItem.update({
          where: { id: item.soLineItemId },
          data: {
            qtyDelivered: {
              increment: item.qty,
            },
          },
        });

        await tx.stockMutation.create({
          data: {
            itemId: item.itemId,
            warehouseId: so.warehouseId,
            qty: item.qty,
            type: MutationType.OUT,
            referenceType: 'DN',
            referenceId: dn.id,
            createdById: userId,
            note: dn.note || `Delivered via DN: ${dn.number}`,
          },
        });

        await tx.stockBalance.update({
          where: {
            itemId_warehouseId: {
              itemId: item.itemId,
              warehouseId: so.warehouseId,
            },
          },
          data: {
            qty: {
              decrement: item.qty,
            },
          },
        });
      }

      const updatedLines = await tx.salesOrderLineItem.findMany({
        where: { salesOrderId: dn.salesOrderId },
      });

      const allDelivered = updatedLines.every((line) => line.qtyDelivered >= line.qty);
      const soStatus = allDelivered ? SalesOrderStatus.DONE : SalesOrderStatus.PARTIAL;

      await tx.salesOrder.update({
        where: { id: dn.salesOrderId },
        data: { status: soStatus },
      });

      // Auto-generate Sales Invoice jika SO sudah DONE (semua item dikirim)
      if (soStatus === SalesOrderStatus.DONE) {
        // Cek jika invoice sudah ada (antisipasi double trigger)
        const existingInvoice = await tx.salesInvoice.findUnique({
          where: { salesOrderId: dn.salesOrderId },
        });

        if (!existingInvoice) {
          // Ambil customer default paymentTermsDays
          const customer = await tx.partner.findFirst({
            where: { id: so.customerId, deletedAt: null },
          });
          const paymentTermsDays = customer?.paymentTermsDays ?? 30;

          // Generate Invoice Number (INV-YYYYMM-XXXX)
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;

          const docSeq = await tx.documentSequence.upsert({
            where: {
              type_year_month: {
                type: 'INV',
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
              type: 'INV',
              year,
              month,
              lastSeq: 1,
            },
          });

          const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
          const paddedMonth = String(month).padStart(2, '0');
          const invoiceNumber = `INV-${year}${paddedMonth}-${paddedSeq}`;

          const invoiceDate = new Date();
          const dueDate = new Date();
          dueDate.setDate(invoiceDate.getDate() + paymentTermsDays);

          // Buat Invoice dan salin line items
          await tx.salesInvoice.create({
            data: {
              number: invoiceNumber,
              salesOrderId: dn.salesOrderId,
              customerId: so.customerId,
              status: 'DRAFT',
              invoiceDate,
              dueDate,
              paymentTermsDays,
              totalAmount: so.totalAmount,
              paidAmount: 0,
              createdById: userId,
              lineItems: {
                create: so.lineItems.map((li) => ({
                  soLineItemId: li.id,
                  itemId: li.itemId,
                  qty: li.qty,
                  unitPrice: li.unitPrice,
                  totalPrice: li.totalPrice,
                })),
              },
            },
          });
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const dn = await this.repository.findById(id);
    if (!dn) {
      throw new NotFoundException(`Delivery Note with ID ${id} not found`);
    }

    if (dn.status !== DeliveryNoteStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Delivery Notes can be deleted`);
    }

    await this.repository.softDelete(id);
  }
}
