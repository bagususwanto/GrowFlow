/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseOrdersRepository } from './purchase-orders.repository';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ListPurchaseOrdersQueryDto } from './dto/list-purchase-orders-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { PurchaseOrderResponseEntity } from './entities/purchase-order-response.entity';
import { PurchaseOrderStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly repository: PurchaseOrdersRepository,
    private readonly prisma: PrismaService,
  ) {}

  private mapToResponse(po: any): PurchaseOrderResponseEntity {
    return {
      id: po.id,
      number: po.number,
      supplierId: po.supplierId,
      status: po.status,
      note: po.note,
      totalAmount: Number(po.totalAmount),
      orderDate: po.orderDate.toISOString(),
      createdById: po.createdById,
      approvedById: po.approvedById,
      approvedAt: po.approvedAt ? po.approvedAt.toISOString() : null,
      cancelledAt: po.cancelledAt ? po.cancelledAt.toISOString() : null,
      deletedAt: po.deletedAt ? po.deletedAt.toISOString() : null,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
      supplier: po.supplier,
      createdBy: po.createdBy,
      approvedBy: po.approvedBy,
      lineItems: po.lineItems?.map((li: any) => ({
        id: li.id,
        purchaseOrderId: li.purchaseOrderId,
        itemId: li.itemId,
        qty: li.qty,
        unitPrice: Number(li.unitPrice),
        totalPrice: Number(li.totalPrice),
        qtyReceived: li.qtyReceived,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
        item: li.item,
      })),
    };
  }

  async findAll(query: ListPurchaseOrdersQueryDto): Promise<PaginatedResponse<PurchaseOrderResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [pos, total] = await this.repository.findAll(query, skip, limit);

    return {
      data: pos.map((po) => this.mapToResponse(po)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<PurchaseOrderResponseEntity> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return this.mapToResponse(po);
  }

  async create(dto: CreatePurchaseOrderDto, userId: string): Promise<PurchaseOrderResponseEntity> {
    // Validasi Supplier
    const supplier = await this.prisma.partner.findFirst({
      where: { id: dto.supplierId, type: 'SUPPLIER', deletedAt: null },
    });
    if (!supplier) {
      throw new BadRequestException(`Supplier with ID ${dto.supplierId} is invalid or does not exist`);
    }

    // Validasi Items
    const itemIds = dto.lineItems.map((item) => item.itemId);
    const dbItems = await this.prisma.item.findMany({
      where: { id: { in: itemIds }, deletedAt: null },
    });
    if (dbItems.length !== itemIds.length) {
      throw new BadRequestException('One or more item IDs in the line items are invalid or do not exist');
    }

    const po = await this.repository.create(dto, userId);
    return this.mapToResponse(po);
  }

  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponseEntity> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Purchase Orders can be updated`);
    }

    if (dto.supplierId) {
      const supplier = await this.prisma.partner.findFirst({
        where: { id: dto.supplierId, type: 'SUPPLIER', deletedAt: null },
      });
      if (!supplier) {
        throw new BadRequestException(`Supplier with ID ${dto.supplierId} is invalid or does not exist`);
      }
    }

    if (dto.lineItems) {
      const itemIds = dto.lineItems.map((item) => item.itemId);
      const dbItems = await this.prisma.item.findMany({
        where: { id: { in: itemIds }, deletedAt: null },
      });
      if (dbItems.length !== itemIds.length) {
        throw new BadRequestException('One or more item IDs in the line items are invalid or do not exist');
      }
    }

    const updatedPo = await this.repository.update(id, dto);
    return this.mapToResponse(updatedPo);
  }

  async submit(id: string): Promise<PurchaseOrderResponseEntity> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Purchase Orders can be submitted`);
    }

    await this.repository.updateStatus(id, PurchaseOrderStatus.SUBMITTED);
    return this.findOne(id);
  }

  async approve(id: string, userId: string): Promise<PurchaseOrderResponseEntity> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    if (po.status !== PurchaseOrderStatus.SUBMITTED) {
      throw new BadRequestException(`Only SUBMITTED Purchase Orders can be approved`);
    }

    await this.repository.updateStatus(id, PurchaseOrderStatus.APPROVED, {
      approvedById: userId,
      approvedAt: new Date(),
    });
    return this.findOne(id);
  }

  async cancel(id: string): Promise<PurchaseOrderResponseEntity> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    if (
      po.status === PurchaseOrderStatus.CANCELLED ||
      po.status === PurchaseOrderStatus.DONE ||
      po.status === PurchaseOrderStatus.PARTIAL
    ) {
      throw new BadRequestException(`Purchase Order with status ${po.status} cannot be cancelled`);
    }

    // Jika status APPROVED, pastikan tidak ada GRN yang CONFIRMED (ini nanti tercover juga di logic goods-receipt)
    // Untuk safety, di service ini kita izinkan cancel jika status DRAFT / SUBMITTED / APPROVED.
    await this.repository.updateStatus(id, PurchaseOrderStatus.CANCELLED, {
      cancelledAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const po = await this.repository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Purchase Orders can be deleted`);
    }

    await this.repository.softDelete(id);
  }
}
