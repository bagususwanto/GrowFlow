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

    // 2. Validasi line items
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
      throw new BadRequestException(`Only DRAFT Delivery Notes can be confirmed`);
    }

    // Cek ulang sisa SO saat konfirmasi (antisipasi double confirm / race conditions)
    const so = await this.prisma.salesOrder.findFirst({
      where: { id: dn.salesOrderId },
      include: { lineItems: true },
    });

    if (!so) {
      throw new BadRequestException(`Referenced Sales Order not found`);
    }

    for (const dnItem of dn.lineItems) {
      const soLine = so.lineItems.find((l) => l.id === dnItem.soLineItemId);
      if (!soLine) {
        throw new BadRequestException(`Invalid SO line reference`);
      }
      const remaining = soLine.qty - soLine.qtyDelivered;
      if (dnItem.qty > remaining) {
        throw new UnprocessableEntityException(
          `Over-deliver validation failed at confirmation. Qty to deliver: ${dnItem.qty}, remaining: ${remaining}.`,
        );
      }

      // Validasi ketersediaan stok fisik di gudang saat konfirmasi Delivery Note
      const balance = await this.prisma.stockBalance.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: dnItem.itemId,
            warehouseId: so.warehouseId,
          },
        },
      });
      const availableQty = balance ? balance.qty : 0;
      if (availableQty < dnItem.qty) {
        throw new UnprocessableEntityException(
          `Stok fisik tidak mencukupi untuk pengiriman barang. Item ID ${dnItem.itemId} hanya tersedia ${availableQty} unit di gudang.`,
        );
      }
    }

    // Jalankan updates dalam transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Update status DN
      await tx.deliveryNote.update({
        where: { id },
        data: { status: DeliveryNoteStatus.CONFIRMED },
      });

      for (const dnItem of dn.lineItems) {
        // 2. Tambahkan qtyDelivered di SO Line Items
        await tx.salesOrderLineItem.update({
          where: { id: dnItem.soLineItemId },
          data: {
            qtyDelivered: {
              increment: dnItem.qty,
            },
          },
        });

        // 3. Catat stock mutation OUT
        await tx.stockMutation.create({
          data: {
            itemId: dnItem.itemId,
            warehouseId: so.warehouseId,
            qty: dnItem.qty,
            type: MutationType.OUT,
            referenceType: 'DN',
            referenceId: dn.id,
            createdById: userId,
            note: dn.note || `Delivered via DN: ${dn.number}`,
          },
        });

        // 4. Update stock balance
        await tx.stockBalance.update({
          where: {
            itemId_warehouseId: {
              itemId: dnItem.itemId,
              warehouseId: so.warehouseId,
            },
          },
          data: {
            qty: {
              decrement: dnItem.qty,
            },
          },
        });
      }

      // 5. Update SO status (PARTIAL / DONE)
      const updatedLines = await tx.salesOrderLineItem.findMany({
        where: { salesOrderId: dn.salesOrderId },
      });

      const allDelivered = updatedLines.every((line) => line.qtyDelivered >= line.qty);
      const soStatus = allDelivered ? SalesOrderStatus.DONE : SalesOrderStatus.PARTIAL;

      await tx.salesOrder.update({
        where: { id: dn.salesOrderId },
        data: { status: soStatus },
      });
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
