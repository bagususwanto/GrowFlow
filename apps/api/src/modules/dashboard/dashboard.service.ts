import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DashboardSummaryResponse } from '@growflow/types';
import { RoleName } from '@growflow/types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(role: RoleName): Promise<DashboardSummaryResponse> {
    const summary: DashboardSummaryResponse = {};

    // 1. Fetch data from DB
    // We fetch everything inside the service, but only map it to the response if the role permits it.
    
    // Total Active Items
    const totalItems = await this.prisma.item.count({
      where: { deletedAt: null, isActive: true },
    });

    // Low stock items query
    const activeItems = await this.prisma.item.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        stockBalances: true,
        category: true,
      },
    });
    const lowStockItems = activeItems
      .filter((item) => {
        const totalStock = item.stockBalances.reduce((sum, bal) => sum + bal.qty, 0);
        return totalStock <= item.minStock;
      })
      .map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        unit: item.unit,
        categoryId: item.categoryId,
        category: item.category
          ? {
              id: item.category.id,
              name: item.category.name,
              description: item.category.description,
              isActive: item.category.isActive,
              deletedAt: item.category.deletedAt ? item.category.deletedAt.toISOString() : null,
              createdAt: item.category.createdAt.toISOString(),
              updatedAt: item.category.updatedAt.toISOString(),
            }
          : null,
        minStock: item.minStock,
        isActive: item.isActive,
        deletedAt: item.deletedAt ? item.deletedAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

    // Purchase Orders stats
    const totalPurchaseOrders = await this.prisma.purchaseOrder.count({
      where: { deletedAt: null },
    });

    const pendingPurchaseOrders = await this.prisma.purchaseOrder.count({
      where: { deletedAt: null, status: 'SUBMITTED' }, // Waiting for approval
    });

    // Sales Orders stats
    const totalSalesOrders = await this.prisma.salesOrder.count({
      where: { deletedAt: null },
    });

    const pendingSalesOrders = await this.prisma.salesOrder.count({
      where: { deletedAt: null, status: 'CONFIRMED' }, // Confirmed but pending delivery
    });

    // Recent POs
    const prismaRecentPOs = await this.prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        supplier: true,
        createdBy: true,
      },
    });

    const recentPurchaseOrders = prismaRecentPOs.map((po) => ({
      id: po.id,
      number: po.number,
      supplierId: po.supplierId,
      status: po.status as any,
      note: po.note,
      totalAmount: po.totalAmount.toNumber(),
      orderDate: po.orderDate.toISOString(),
      createdById: po.createdById,
      approvedById: po.approvedById,
      approvedAt: po.approvedAt ? po.approvedAt.toISOString() : null,
      cancelledAt: po.cancelledAt ? po.cancelledAt.toISOString() : null,
      deletedAt: po.deletedAt ? po.deletedAt.toISOString() : null,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
      supplier: {
        id: po.supplier.id,
        code: po.supplier.code,
        name: po.supplier.name,
      },
      createdBy: po.createdBy
        ? {
            id: po.createdBy.id,
            name: po.createdBy.name,
          }
        : undefined,
    }));

    // Recent SOs
    const prismaRecentSOs = await this.prisma.salesOrder.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: true,
        createdBy: true,
      },
    });

    const recentSalesOrders = prismaRecentSOs.map((so) => ({
      id: so.id,
      number: so.number,
      customerId: so.customerId,
      warehouseId: so.warehouseId,
      status: so.status as any,
      note: so.note,
      totalAmount: so.totalAmount.toNumber(),
      orderDate: so.orderDate.toISOString(),
      createdById: so.createdById,
      confirmedById: so.confirmedById,
      confirmedAt: so.confirmedAt ? so.confirmedAt.toISOString() : null,
      cancelledAt: so.cancelledAt ? so.cancelledAt.toISOString() : null,
      deletedAt: so.deletedAt ? so.deletedAt.toISOString() : null,
      createdAt: so.createdAt.toISOString(),
      updatedAt: so.updatedAt.toISOString(),
      customer: {
        id: so.customer.id,
        code: so.customer.code,
        name: so.customer.name,
      },
      createdBy: so.createdBy
        ? {
            id: so.createdBy.id,
            name: so.createdBy.name,
          }
        : undefined,
    }));

    // 2. Map data based on user role
    if (role === 'superadmin' || role === 'manager' || role === 'staff') {
      summary.totalItems = totalItems;
      summary.lowStockItems = lowStockItems;
      summary.totalPurchaseOrders = totalPurchaseOrders;
      summary.pendingPurchaseOrders = pendingPurchaseOrders;
      summary.totalSalesOrders = totalSalesOrders;
      summary.pendingSalesOrders = pendingSalesOrders;
      summary.recentPurchaseOrders = recentPurchaseOrders;
      summary.recentSalesOrders = recentSalesOrders;
    } else if (role === 'warehouse') {
      summary.totalItems = totalItems;
      summary.lowStockItems = lowStockItems;
      summary.pendingSalesOrders = pendingSalesOrders;
      summary.recentSalesOrders = recentSalesOrders;
    } else if (role === 'finance') {
      summary.totalPurchaseOrders = totalPurchaseOrders;
      summary.pendingPurchaseOrders = pendingPurchaseOrders;
      summary.totalSalesOrders = totalSalesOrders;
      summary.pendingSalesOrders = pendingSalesOrders;
      summary.recentPurchaseOrders = recentPurchaseOrders;
      summary.recentSalesOrders = recentSalesOrders;
    }

    return summary;
  }
}
