import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { GoodsReceiptsRepository } from './goods-receipts.repository';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { ListGoodsReceiptsQueryDto } from './dto/list-goods-receipts-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { GoodsReceiptResponseEntity } from './entities/goods-receipt-response.entity';
import { GoodsReceiptStatus, PurchaseOrderStatus, MutationType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private readonly repository: GoodsReceiptsRepository,
    private readonly prisma: PrismaService,
  ) {}

  private mapToResponse(gr: any): GoodsReceiptResponseEntity {
    return {
      id: gr.id,
      number: gr.number,
      purchaseOrderId: gr.purchaseOrderId,
      warehouseId: gr.warehouseId,
      status: gr.status,
      receivedDate: gr.receivedDate.toISOString(),
      note: gr.note,
      createdById: gr.createdById,
      deletedAt: gr.deletedAt ? gr.deletedAt.toISOString() : null,
      createdAt: gr.createdAt.toISOString(),
      updatedAt: gr.updatedAt.toISOString(),
      purchaseOrder: gr.purchaseOrder,
      warehouse: gr.warehouse,
      createdBy: gr.createdBy,
      lineItems: gr.lineItems?.map((li: any) => ({
        id: li.id,
        goodsReceiptId: li.goodsReceiptId,
        poLineItemId: li.poLineItemId,
        itemId: li.itemId,
        qty: li.qty,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
        item: li.item,
        poLineItem: li.poLineItem ? {
          id: li.poLineItem.id,
          qty: li.poLineItem.qty,
          qtyReceived: li.poLineItem.qtyReceived,
          unitPrice: Number(li.poLineItem.unitPrice),
        } : undefined,
      })),
    };
  }

  async findAll(query: ListGoodsReceiptsQueryDto): Promise<PaginatedResponse<GoodsReceiptResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [grs, total] = await this.repository.findAll(query, skip, limit);

    return {
      data: grs.map((gr) => this.mapToResponse(gr)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<GoodsReceiptResponseEntity> {
    const gr = await this.repository.findById(id);
    if (!gr) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }
    return this.mapToResponse(gr);
  }

  async create(dto: CreateGoodsReceiptDto, userId: string): Promise<GoodsReceiptResponseEntity> {
    // 1. Validasi PO status harus APPROVED atau PARTIAL
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, deletedAt: null },
      include: { lineItems: true },
    });

    if (!po) {
      throw new BadRequestException(`Purchase Order with ID ${dto.purchaseOrderId} not found`);
    }

    if (po.status !== PurchaseOrderStatus.APPROVED && po.status !== PurchaseOrderStatus.PARTIAL) {
      throw new BadRequestException(`Cannot create Goods Receipt for Purchase Order with status ${po.status}`);
    }

    // 2. Validasi Warehouse
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, isActive: true, deletedAt: null },
    });
    if (!warehouse) {
      throw new BadRequestException(`Warehouse with ID ${dto.warehouseId} is invalid or inactive`);
    }

    // 3. Validasi line items
    for (const item of dto.lineItems) {
      const poLine = po.lineItems.find((l) => l.id === item.poLineItemId);
      if (!poLine) {
        throw new BadRequestException(`PO Line Item ${item.poLineItemId} does not belong to PO ${dto.purchaseOrderId}`);
      }

      if (poLine.itemId !== item.itemId) {
        throw new BadRequestException(`Item ID mismatch on PO Line Item ${item.poLineItemId}`);
      }

      const remaining = poLine.qty - poLine.qtyReceived;
      if (item.qty > remaining) {
        throw new UnprocessableEntityException(
          `Cannot receive ${item.qty} units of item ${item.itemId}. Only ${remaining} units remaining on PO.`,
        );
      }
    }

    const gr = await this.repository.create(dto, userId);
    return this.mapToResponse(gr);
  }

  async confirm(id: string, userId: string): Promise<GoodsReceiptResponseEntity> {
    const gr = await this.repository.findById(id);
    if (!gr) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    if (gr.status !== GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException(`Goods Receipt is already ${gr.status}`);
    }

    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: gr.purchaseOrderId, deletedAt: null },
      include: { lineItems: true },
    });

    if (!po) {
      throw new BadRequestException(`Purchase Order with ID ${gr.purchaseOrderId} not found`);
    }

    if (po.status !== PurchaseOrderStatus.APPROVED && po.status !== PurchaseOrderStatus.PARTIAL) {
      throw new BadRequestException(`Cannot confirm Goods Receipt for Purchase Order with status ${po.status}`);
    }

    for (const item of gr.lineItems) {
      const poLine = po.lineItems.find((l) => l.id === item.poLineItemId);
      if (!poLine) {
        throw new BadRequestException(`PO Line Item ${item.poLineItemId} does not belong to PO ${gr.purchaseOrderId}`);
      }

      const remaining = poLine.qty - poLine.qtyReceived;
      if (item.qty > remaining) {
        throw new UnprocessableEntityException(
          `Cannot receive ${item.qty} units of item ${item.item.name}. Only ${remaining} units remaining on PO.`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.goodsReceipt.update({
        where: { id },
        data: { status: GoodsReceiptStatus.CONFIRMED },
      });

      for (const item of gr.lineItems) {
        await tx.purchaseOrderLineItem.update({
          where: { id: item.poLineItemId },
          data: {
            qtyReceived: {
              increment: item.qty,
            },
          },
        });

        await tx.stockMutation.create({
          data: {
            itemId: item.itemId,
            warehouseId: gr.warehouseId,
            qty: item.qty,
            type: MutationType.IN,
            referenceType: 'GRN',
            referenceId: gr.id,
            createdById: userId,
            note: gr.note || `Received via GRN: ${gr.number}`,
          },
        });

        await tx.stockBalance.upsert({
          where: {
            itemId_warehouseId: {
              itemId: item.itemId,
              warehouseId: gr.warehouseId,
            },
          },
          update: {
            qty: {
              increment: item.qty,
            },
          },
          create: {
            itemId: item.itemId,
            warehouseId: gr.warehouseId,
            qty: item.qty,
          },
        });
      }

      const updatedLines = await tx.purchaseOrderLineItem.findMany({
        where: { purchaseOrderId: gr.purchaseOrderId },
      });

      const allReceived = updatedLines.every((line) => line.qtyReceived >= line.qty);
      const poStatus = allReceived ? PurchaseOrderStatus.DONE : PurchaseOrderStatus.PARTIAL;

      await tx.purchaseOrder.update({
        where: { id: gr.purchaseOrderId },
        data: { status: poStatus },
      });
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const gr = await this.repository.findById(id);
    if (!gr) {
      throw new NotFoundException(`Goods Receipt with ID ${id} not found`);
    }

    if (gr.status !== GoodsReceiptStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Goods Receipts can be deleted`);
    }

    await this.repository.softDelete(id);
  }
}
