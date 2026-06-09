import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DashboardSummaryResponse, RoleName, LowStockItem, PurchaseOrderStatus, SalesOrderStatus } from '@growflow/types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(role: RoleName): Promise<DashboardSummaryResponse> {
    const summary: DashboardSummaryResponse = {};

    // 1. Fetch data from DB in parallel to resolve N+1 sequential latency issues
    const [
      totalItems,
      activeItems,
      totalPurchaseOrders,
      pendingPurchaseOrders,
      totalSalesOrders,
      pendingSalesOrders,
      prismaRecentPOs,
      prismaRecentSOs,
    ] = await Promise.all([
      // Total Active Items
      this.prisma.item.count({
        where: { deletedAt: null, isActive: true },
      }),
      // Low stock items query
      this.prisma.item.findMany({
        where: { deletedAt: null, isActive: true },
        include: {
          stockBalances: {
            include: {
              warehouse: true,
            },
          },
          category: true,
        },
      }),
      // Purchase Orders stats
      this.prisma.purchaseOrder.count({
        where: { deletedAt: null },
      }),
      this.prisma.purchaseOrder.count({
        where: { deletedAt: null, status: 'SUBMITTED' }, // Waiting for approval
      }),
      // Sales Orders stats
      this.prisma.salesOrder.count({
        where: { deletedAt: null },
      }),
      this.prisma.salesOrder.count({
        where: { deletedAt: null, status: 'CONFIRMED' }, // Confirmed but pending delivery
      }),
      // Recent POs
      this.prisma.purchaseOrder.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          supplier: true,
          createdBy: true,
        },
      }),
      // Recent SOs
      this.prisma.salesOrder.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: true,
          createdBy: true,
        },
      }),
    ]);

    const lowStockItems: LowStockItem[] = [];
    for (const item of activeItems) {
      if (item.minStock <= 0) continue;

      // Check each warehouse balance
      for (const bal of item.stockBalances) {
        if (bal.qty <= item.minStock) {
          lowStockItems.push({
            id: `${item.id}-${bal.warehouseId}`,
            code: item.code,
            name: item.name,
            unit: item.unit,
            minStock: item.minStock,
            currentStock: bal.qty,
            warehouseName: bal.warehouse.name,
            itemId: item.id,
            warehouseId: bal.warehouseId,
            category: item.category
              ? {
                  id: item.category.id,
                  name: item.category.name,
                }
              : null,
          });
        }
      }

      // If no warehouse balances exist, stock is 0 globally
      if (item.stockBalances.length === 0) {
        lowStockItems.push({
          id: `${item.id}-none`,
          code: item.code,
          name: item.name,
          unit: item.unit,
          minStock: item.minStock,
          currentStock: 0,
          warehouseName: 'No Warehouse Stocked',
          itemId: item.id,
          category: item.category
            ? {
                id: item.category.id,
                name: item.category.name,
              }
            : null,
        });
      }
    }

    const recentPurchaseOrders = prismaRecentPOs.map((po) => ({
      id: po.id,
      number: po.number,
      supplierId: po.supplierId,
      status: po.status as PurchaseOrderStatus,
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

    const recentSalesOrders = prismaRecentSOs.map((so) => ({
      id: so.id,
      number: so.number,
      customerId: so.customerId,
      warehouseId: so.warehouseId,
      status: so.status as SalesOrderStatus,
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
    if (role === 'superadmin' || role === 'manager' || role === 'sales' || role === 'purchasing') {
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
