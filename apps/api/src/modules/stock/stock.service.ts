import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StockRepository } from './stock.repository';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { ListStockMutationsQueryDto } from './dto/list-stock-mutations-query.dto';
import { ListStockBalancesQueryDto } from './dto/list-stock-balances-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { StockBalanceResponseEntity } from './entities/stock-balance-response.entity';
import { StockMutationResponseEntity } from './entities/stock-mutation-response.entity';
import { StockBalance, StockMutation } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  private mapBalance(balance: any): StockBalanceResponseEntity {
    return {
      id: balance.id,
      qty: balance.qty,
      itemId: balance.itemId,
      item: balance.item ? {
        id: balance.item.id,
        code: balance.item.code,
        name: balance.item.name,
        unit: balance.item.unit,
        categoryId: balance.item.categoryId,
        minStock: balance.item.minStock,
        isActive: balance.item.isActive,
        deletedAt: balance.item.deletedAt ? balance.item.deletedAt.toISOString() : null,
        createdAt: balance.item.createdAt.toISOString(),
        updatedAt: balance.item.updatedAt.toISOString(),
      } : undefined,
      warehouseId: balance.warehouseId,
      warehouse: balance.warehouse ? {
        id: balance.warehouse.id,
        name: balance.warehouse.name,
        address: balance.warehouse.address,
        isActive: balance.warehouse.isActive,
        createdAt: balance.warehouse.createdAt.toISOString(),
        updatedAt: balance.warehouse.updatedAt.toISOString(),
      } : undefined,
      createdAt: balance.createdAt.toISOString(),
      updatedAt: balance.updatedAt.toISOString(),
    };
  }

  private mapMutation(mutation: any): StockMutationResponseEntity {
    return {
      id: mutation.id,
      qty: mutation.qty,
      type: mutation.type,
      referenceType: mutation.referenceType,
      referenceId: mutation.referenceId,
      note: mutation.note,
      itemId: mutation.itemId,
      item: mutation.item ? {
        id: mutation.item.id,
        code: mutation.item.code,
        name: mutation.item.name,
        unit: mutation.item.unit,
        categoryId: mutation.item.categoryId,
        minStock: mutation.item.minStock,
        isActive: mutation.item.isActive,
        deletedAt: mutation.item.deletedAt ? mutation.item.deletedAt.toISOString() : null,
        createdAt: mutation.item.createdAt.toISOString(),
        updatedAt: mutation.item.updatedAt.toISOString(),
      } : undefined,
      warehouseId: mutation.warehouseId,
      warehouse: mutation.warehouse ? {
        id: mutation.warehouse.id,
        name: mutation.warehouse.name,
        address: mutation.warehouse.address,
        isActive: mutation.warehouse.isActive,
        createdAt: mutation.warehouse.createdAt.toISOString(),
        updatedAt: mutation.warehouse.updatedAt.toISOString(),
      } : undefined,
      createdById: mutation.createdById,
      createdAt: mutation.createdAt.toISOString(),
    };
  }

  async getBalance(itemId: string, warehouseId: string): Promise<StockBalanceResponseEntity> {
    const balance = await this.stockRepository.findBalance(itemId, warehouseId);
    if (!balance) {
      throw new NotFoundException(`Stock balance not found for item ${itemId} in warehouse ${warehouseId}`);
    }
    return this.mapBalance(balance);
  }

  async adjustStock(
    dto: StockAdjustmentDto,
    userId: string,
  ): Promise<{ balance: StockBalanceResponseEntity; mutation: StockMutationResponseEntity }> {
    if (dto.qty === 0) {
      throw new BadRequestException('Adjustment quantity cannot be zero');
    }

    const { balance, mutation } = await this.stockRepository.adjustStock(
      dto.itemId,
      dto.warehouseId,
      dto.qty,
      'ADJUSTMENT',
      dto.note,
      userId,
    );

    return {
      balance: this.mapBalance(balance),
      mutation: this.mapMutation(mutation),
    };
  }

  async listMutations(query: ListStockMutationsQueryDto): Promise<PaginatedResponse<StockMutationResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [mutations, total] = await this.stockRepository.findMutations(query, skip, limit);

    return {
      data: mutations.map(m => this.mapMutation(m)),
      total,
      page,
      limit,
    };
  }

  async listBalances(query: ListStockBalancesQueryDto): Promise<PaginatedResponse<StockBalanceResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [balances, total] = await this.stockRepository.findBalances(query, skip, limit);

    return {
      data: balances.map(b => this.mapBalance(b)),
      total,
      page,
      limit,
    };
  }
}
