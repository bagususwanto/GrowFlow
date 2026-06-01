/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { SalesOrdersRepository } from './sales-orders.repository';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { ListSalesOrdersQueryDto } from './dto/list-sales-orders-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { SalesOrderResponseEntity } from './entities/sales-order-response.entity';
import { SalesOrderStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly repository: SalesOrdersRepository,
    private readonly prisma: PrismaService,
  ) {}

  private mapToResponse(so: any): SalesOrderResponseEntity {
    return {
      id: so.id,
      number: so.number,
      customerId: so.customerId,
      warehouseId: so.warehouseId,
      status: so.status,
      note: so.note,
      totalAmount: Number(so.totalAmount),
      orderDate: so.orderDate.toISOString(),
      createdById: so.createdById,
      confirmedById: so.confirmedById,
      confirmedAt: so.confirmedAt ? so.confirmedAt.toISOString() : null,
      cancelledAt: so.cancelledAt ? so.cancelledAt.toISOString() : null,
      deletedAt: so.deletedAt ? so.deletedAt.toISOString() : null,
      createdAt: so.createdAt.toISOString(),
      updatedAt: so.updatedAt.toISOString(),
      customer: so.customer,
      warehouse: so.warehouse,
      createdBy: so.createdBy,
      confirmedBy: so.confirmedBy,
      lineItems: so.lineItems?.map((li: any) => ({
        id: li.id,
        salesOrderId: li.salesOrderId,
        itemId: li.itemId,
        qty: li.qty,
        unitPrice: Number(li.unitPrice),
        totalPrice: Number(li.totalPrice),
        qtyDelivered: li.qtyDelivered,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
        item: li.item,
      })),
      deliveryNotes: so.deliveryNotes?.map((dn: any) => ({
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
        createdBy: dn.createdBy,
      })),
    };
  }


  async findAll(query: ListSalesOrdersQueryDto): Promise<PaginatedResponse<SalesOrderResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [sos, total] = await this.repository.findAll(query, skip, limit);

    return {
      data: sos.map((so) => this.mapToResponse(so)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<SalesOrderResponseEntity> {
    const so = await this.repository.findById(id);
    if (!so) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }
    return this.mapToResponse(so);
  }

  async create(dto: CreateSalesOrderDto, userId: string): Promise<SalesOrderResponseEntity> {
    // Validasi Customer
    const customer = await this.prisma.partner.findFirst({
      where: { id: dto.customerId, type: 'CUSTOMER', deletedAt: null },
    });
    if (!customer) {
      throw new BadRequestException(`Customer with ID ${dto.customerId} is invalid or does not exist`);
    }

    // Validasi Warehouse
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, isActive: true, deletedAt: null },
    });
    if (!warehouse) {
      throw new BadRequestException(`Warehouse with ID ${dto.warehouseId} is invalid or inactive`);
    }

    // Validasi Items
    for (const item of dto.lineItems) {
      const dbItem = await this.prisma.item.findFirst({
        where: { id: item.itemId, deletedAt: null },
      });
      if (!dbItem) {
        throw new BadRequestException(`Item with ID ${item.itemId} is invalid or does not exist`);
      }
    }

    const so = await this.repository.create(dto, userId);
    return this.mapToResponse(so);
  }

  async update(id: string, dto: UpdateSalesOrderDto): Promise<SalesOrderResponseEntity> {
    const so = await this.repository.findById(id);
    if (!so) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    if (so.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Sales Orders can be updated`);
    }

    if (dto.customerId) {
      const customer = await this.prisma.partner.findFirst({
        where: { id: dto.customerId, type: 'CUSTOMER', deletedAt: null },
      });
      if (!customer) {
        throw new BadRequestException(`Customer with ID ${dto.customerId} is invalid or does not exist`);
      }
    }

    if (dto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, isActive: true, deletedAt: null },
      });
      if (!warehouse) {
        throw new BadRequestException(`Warehouse with ID ${dto.warehouseId} is invalid or inactive`);
      }
    }

    if (dto.lineItems) {
      for (const item of dto.lineItems) {
        const dbItem = await this.prisma.item.findFirst({
          where: { id: item.itemId, deletedAt: null },
        });
        if (!dbItem) {
          throw new BadRequestException(`Item with ID ${item.itemId} is invalid or does not exist`);
        }
      }
    }

    const updatedSo = await this.repository.update(id, dto);
    return this.mapToResponse(updatedSo);
  }

  async confirm(id: string, userId: string): Promise<SalesOrderResponseEntity> {
    const so = await this.repository.findById(id);
    if (!so) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    if (so.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Sales Orders can be confirmed`);
    }

    // Validasi Stok untuk setiap line item di warehouse SO
    for (const item of so.lineItems) {
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
          `Stock for item ${item.item?.name || item.itemId} is insufficient in warehouse ${so.warehouse?.name}. Available: ${availableQty}, Required: ${item.qty}`,
        );
      }
    }

    await this.repository.updateStatus(id, SalesOrderStatus.CONFIRMED, {
      confirmedById: userId,
      confirmedAt: new Date(),
    });
    return this.findOne(id);
  }

  async cancel(id: string): Promise<SalesOrderResponseEntity> {
    const so = await this.repository.findById(id);
    if (!so) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    if (
      so.status === SalesOrderStatus.CANCELLED ||
      so.status === SalesOrderStatus.DONE ||
      so.status === SalesOrderStatus.PARTIAL
    ) {
      throw new BadRequestException(`Sales Order with status ${so.status} cannot be cancelled`);
    }

    // Jika CONFIRMED, pastikan belum ada Delivery Note yang CONFIRMED
    if (so.status === SalesOrderStatus.CONFIRMED) {
      const hasConfirmedDN = so.deliveryNotes?.some((dn: any) => dn.status === 'CONFIRMED');
      if (hasConfirmedDN) {
        throw new BadRequestException(`Cannot cancel Sales Order because confirmed delivery notes exist`);
      }
    }

    await this.repository.updateStatus(id, SalesOrderStatus.CANCELLED, {
      cancelledAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const so = await this.repository.findById(id);
    if (!so) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    if (so.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT Sales Orders can be deleted`);
    }

    await this.repository.softDelete(id);
  }
}
