import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockBalance, StockMutation, Prisma, MutationType } from '@prisma/client';

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

  async findMutations(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StockMutationWhereInput;
  }): Promise<[StockMutation[], number]> {
    const [data, total] = await Promise.all([
      this.prisma.stockMutation.findMany({
        skip: params.skip,
        take: params.take,
        where: params.where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMutation.count({ where: params.where }),
    ]);
    return [data, total];
  }
}
