import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';
import { Account as SharedAccount } from '@growflow/types';
import { Account } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  private mapToResponse(acc: Account & { parent?: { id: string; code: string; name: string } | null; children?: Account[] }): SharedAccount {
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
      parent: acc.parent ? {
        id: acc.parent.id,
        code: acc.parent.code,
        name: acc.parent.name,
      } : null,
      children: acc.children ? acc.children.map(c => this.mapToResponse(c)) : [],
    };
  }

  async findAll(query: ListAccountsQueryDto): Promise<SharedAccount[]> {
    const accounts = await this.accountsRepository.findAll(query);
    
    // If we want to return hierarchical view, we can filter to only top level accounts
    // but the user wants to list COA. Usually a tree or list is fine.
    // Let's return all accounts, but map them properly. The frontend can build the tree if needed,
    // or we can return the entire list. Returning the list sorted by code is standard.
    return accounts.map(a => this.mapToResponse(a));
  }

  async findOne(id: string): Promise<SharedAccount> {
    const account = await this.accountsRepository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return this.mapToResponse(account);
  }

  async create(dto: CreateAccountDto): Promise<SharedAccount> {
    const existing = await this.accountsRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Account with code ${dto.code} already exists`);
    }

    if (dto.parentId) {
      const parent = await this.accountsRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent account with ID ${dto.parentId} not found`);
      }
    }

    const account = await this.accountsRepository.create(dto);
    return this.mapToResponse(account);
  }

  async update(id: string, dto: UpdateAccountDto): Promise<SharedAccount> {
    const account = await this.accountsRepository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException(`An account cannot be its own parent`);
      }
      const parent = await this.accountsRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent account with ID ${dto.parentId} not found`);
      }
    }

    const updated = await this.accountsRepository.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const account = await this.accountsRepository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    if (account.isSystemAccount) {
      throw new ConflictException(`System account with ID ${id} cannot be deleted`);
    }

    const hasChildren = await this.accountsRepository.hasChildren(id);
    if (hasChildren) {
      throw new ConflictException(`Account with ID ${id} has child accounts and cannot be deleted`);
    }

    const hasTransactions = await this.accountsRepository.hasJournalLines(id);
    if (hasTransactions) {
      throw new ConflictException(`Account with ID ${id} has journal transactions and cannot be deleted`);
    }

    await this.accountsRepository.softDelete(id);
  }
}
