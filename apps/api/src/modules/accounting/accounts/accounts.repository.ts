import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ListAccountsQueryDto } from './dto/list-accounts-query.dto';

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: ListAccountsQueryDto): Prisma.AccountWhereInput {
    const where: Prisma.AccountWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = query.category;
    }

    return where;
  }

  async findAll(query: ListAccountsQueryDto): Promise<Account[]> {
    const where = this.buildWhereClause(query);
    return this.prisma.account.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        children: {
          where: { deletedAt: null },
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  async findById(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        children: {
          where: { deletedAt: null },
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  async findByCode(code: string): Promise<Account | null> {
    return this.prisma.account.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async create(data: CreateAccountDto): Promise<Account> {
    return this.prisma.account.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        category: data.category,
        parentId: data.parentId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        parentId: data.parentId !== undefined ? data.parentId : undefined,
        isActive: data.isActive,
      },
    });
  }

  async softDelete(id: string): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async hasChildren(id: string): Promise<boolean> {
    const count = await this.prisma.account.count({
      where: { parentId: id, deletedAt: null },
    });
    return count > 0;
  }

  async hasJournalLines(id: string): Promise<boolean> {
    const count = await this.prisma.journalLine.count({
      where: { accountId: id },
    });
    return count > 0;
  }
}
