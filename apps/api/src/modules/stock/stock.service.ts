import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StockRepository } from './stock.repository';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { ListStockMutationsQueryDto } from './dto/list-stock-mutations-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { StockBalanceResponseEntity } from './entities/stock-balance-response.entity';
import { StockMutationResponseEntity } from './entities/stock-mutation-response.entity';
import { StockBalance, StockMutation } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  private mapBalance(balance: StockBalance): StockBalanceResponseEntity {
    return {
      id: balance.id,
      qty: balance.qty,
      itemId: balance.itemId,
      warehouseId: balance.warehouseId,
      createdAt: balance.createdAt.toISOString(),
      updatedAt: balance.updatedAt.toISOString(),
    };
  }

  private mapMutation(mutation: StockMutation): StockMutationResponseEntity {
    return {
      id: mutation.id,
      qty: mutation.qty,
      type: mutation.type,
      referenceType: mutation.referenceType,
      referenceId: mutation.referenceId,
      note: mutation.note,
      itemId: mutation.itemId,
      warehouseId: mutation.warehouseId,
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

    const where: any = {};
    if (query.itemId) where.itemId = query.itemId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.type) where.type = query.type;
    
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [mutations, total] = await this.stockRepository.findMutations({ skip, take: limit, where });

    return {
      data: mutations.map(m => this.mapMutation(m)),
      total,
      page,
      limit,
    };
  }
}
