import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { StockBalance, StockMutation, Prisma, MutationType } from '@prisma/client';
import { ListStockMutationsQueryDto } from './dto/list-stock-mutations-query.dto';
import { ListStockBalancesQueryDto } from './dto/list-stock-balances-query.dto';

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBalance(itemId: string, warehouseId: string): Promise<StockBalance | null> {
    return this.prisma.stockBalance.findUnique({
      where: {
        itemId_warehouseId: { itemId, warehouseId },
      },
    });
  }

  async getBalancesByItem(itemId: string): Promise<StockBalance[]> {
    return this.prisma.stockBalance.findMany({
      where: { itemId },
    });
  }
  
  async getBalancesByWarehouse(warehouseId: string): Promise<StockBalance[]> {
    return this.prisma.stockBalance.findMany({
      where: { warehouseId },
    });
  }

  async adjustStock(
    itemId: string,
    warehouseId: string,
    qty: number,
    type: MutationType,
    note?: string,
    createdById?: string,
  ): Promise<{ balance: StockBalance; mutation: StockMutation }> {
    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.stockBalance.upsert({
        where: { itemId_warehouseId: { itemId, warehouseId } },
        create: {
          itemId,
          warehouseId,
          qty: qty > 0 ? qty : 0,
        },
        update: {
          qty: { increment: qty },
        },
      });

      const mutation = await tx.stockMutation.create({
        data: {
          qty,
          type,
          itemId,
          warehouseId,
          note,
          createdById,
        },
      });

      return { balance, mutation };
    });
  }

  buildWhereClause(query: ListStockMutationsQueryDto): Prisma.StockMutationWhereInput {
    const where: Prisma.StockMutationWhereInput = {};
    if (query.itemId) {
      where.itemId = query.itemId;
    }
    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }
    return where;
  }

  async findMutations(
    query: ListStockMutationsQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[StockMutation[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.stockMutation.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          item: true,
          warehouse: true,
        },
      }),
      this.prisma.stockMutation.count({ where }),
    ]);
    return [data, total];
  }

  buildBalanceWhereClause(query: ListStockBalancesQueryDto): Prisma.StockBalanceWhereInput {
    const where: Prisma.StockBalanceWhereInput = {};
    if (query.itemId) {
      where.itemId = query.itemId;
    }
    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }
    if (query.search) {
      where.item = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }
    return where;
  }

  async findBalances(
    query: ListStockBalancesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[StockBalance[], number]> {
    const where = this.buildBalanceWhereClause(query);
    const sortBy = query.sortBy || 'updatedAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.stockBalance.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: {
          item: true,
          warehouse: true,
        },
      }),
      this.prisma.stockBalance.count({ where }),
    ]);
    return [data, total];
  }
}
