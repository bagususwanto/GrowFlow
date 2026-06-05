import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UpdateAccountingSettingsDto } from './dto/update-accounting-settings.dto';
import { AccountingSettings as SharedAccountingSettings } from '@growflow/types';
import { AccountingSettings } from '@prisma/client';

@Injectable()
export class AccountingSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async mapToResponse(settings: AccountingSettings): Promise<SharedAccountingSettings> {
    const fetchAccount = async (id: string) => {
      const acc = await this.prisma.account.findUnique({ where: { id } });
      if (!acc) return undefined;
      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type as any,
        category: acc.category as any,
        parentId: acc.parentId,
        isSystemAccount: acc.isSystemAccount,
        isActive: acc.isActive,
        createdAt: acc.createdAt.toISOString(),
        updatedAt: acc.updatedAt.toISOString(),
      };
    };

    return {
      id: settings.id,
      apAccountId: settings.apAccountId,
      arAccountId: settings.arAccountId,
      cashAccountId: settings.cashAccountId,
      inventoryAccountId: settings.inventoryAccountId,
      cogsAccountId: settings.cogsAccountId,
      revenueAccountId: settings.revenueAccountId,
      purchaseAccountId: settings.purchaseAccountId,
      updatedAt: settings.updatedAt.toISOString(),
      apAccount: await fetchAccount(settings.apAccountId),
      arAccount: await fetchAccount(settings.arAccountId),
      cashAccount: await fetchAccount(settings.cashAccountId),
      inventoryAccount: await fetchAccount(settings.inventoryAccountId),
      cogsAccount: await fetchAccount(settings.cogsAccountId),
      revenueAccount: await fetchAccount(settings.revenueAccountId),
      purchaseAccount: await fetchAccount(settings.purchaseAccountId),
    };
  }

  async getSettings(): Promise<SharedAccountingSettings> {
    const settings = await this.prisma.accountingSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new NotFoundException('Accounting settings not initialized');
    }
    return this.mapToResponse(settings);
  }

  async updateSettings(dto: UpdateAccountingSettingsDto): Promise<SharedAccountingSettings> {
    // Validate accounts exist
    const validateAccount = async (id: string, name: string) => {
      const acc = await this.prisma.account.findUnique({ where: { id, deletedAt: null } });
      if (!acc) {
        throw new BadRequestException(`Account provided for ${name} (ID: ${id}) does not exist or is deleted`);
      }
    };

    if (dto.apAccountId) await validateAccount(dto.apAccountId, 'AP Account');
    if (dto.arAccountId) await validateAccount(dto.arAccountId, 'AR Account');
    if (dto.cashAccountId) await validateAccount(dto.cashAccountId, 'Cash Account');
    if (dto.inventoryAccountId) await validateAccount(dto.inventoryAccountId, 'Inventory Account');
    if (dto.cogsAccountId) await validateAccount(dto.cogsAccountId, 'COGS Account');
    if (dto.revenueAccountId) await validateAccount(dto.revenueAccountId, 'Revenue Account');
    if (dto.purchaseAccountId) await validateAccount(dto.purchaseAccountId, 'Purchase Account');

    const settings = await this.prisma.accountingSettings.upsert({
      where: { id: 'default' },
      update: {
        apAccountId: dto.apAccountId,
        arAccountId: dto.arAccountId,
        cashAccountId: dto.cashAccountId,
        inventoryAccountId: dto.inventoryAccountId,
        cogsAccountId: dto.cogsAccountId,
        revenueAccountId: dto.revenueAccountId,
        purchaseAccountId: dto.purchaseAccountId,
      },
      create: {
        id: 'default',
        apAccountId: dto.apAccountId || '',
        arAccountId: dto.arAccountId || '',
        cashAccountId: dto.cashAccountId || '',
        inventoryAccountId: dto.inventoryAccountId || '',
        cogsAccountId: dto.cogsAccountId || '',
        revenueAccountId: dto.revenueAccountId || '',
        purchaseAccountId: dto.purchaseAccountId || '',
      },
    });

    return this.mapToResponse(settings);
  }
}
