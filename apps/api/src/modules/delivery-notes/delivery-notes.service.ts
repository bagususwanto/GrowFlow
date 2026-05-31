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

      // Validasi ketersediaan stok fisik di gudang asal
      const balance = await this.prisma.stockBalance.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: item.itemId,
            warehouseId: so.warehouseId,
          },
        },
      });
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

      const balance = await this.prisma.stockBalance.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: item.itemId,
            warehouseId: so.warehouseId,
          },
        },
      });
      const availableQty = balance ? balance.qty : 0;
      if (availableQty < item.qty) {
        throw new UnprocessableEntityException(
          `Insufficient physical stock for delivery. Item ${item.item.name} only has ${availableQty} units available in the warehouse.`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
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
