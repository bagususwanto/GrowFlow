import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { JournalEntry, JournalLine, Prisma, JournalEntryStatus } from '@prisma/client';
import { ListJournalEntriesQueryDto } from './dto/list-journal-entries-query.dto';

@Injectable()
export class JournalEntriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: ListJournalEntriesQueryDto): Prisma.JournalEntryWhereInput {
    const where: Prisma.JournalEntryWhereInput = {};

    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.entryDate = {};
      if (query.startDate) {
        where.entryDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.entryDate.lte = new Date(query.endDate);
      }
    }

    return where;
  }

  async findAll(
    query: ListJournalEntriesQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[any[], number]> {
    const where = this.buildWhereClause(query);
    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        skip,
        take,
        where,
        orderBy: { entryDate: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          postedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        postedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async generateJENumber(tx: Prisma.TransactionClient = this.prisma): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const docSeq = await tx.documentSequence.upsert({
      where: {
        type_year_month: {
          type: 'JE',
          year,
          month,
        },
      },
      update: {
        lastSeq: {
          increment: 1,
        },
      },
      create: {
        type: 'JE',
        year,
        month,
        lastSeq: 1,
      },
    });

    const paddedSeq = String(docSeq.lastSeq).padStart(4, '0');
    const paddedMonth = String(month).padStart(2, '0');
    return `JE-${year}${paddedMonth}-${paddedSeq}`;
  }

  async create(
    data: {
      entryDate: Date;
      description?: string | null;
      sourceType?: string | null;
      sourceId?: string | null;
      status: JournalEntryStatus;
      createdById?: string | null;
      postedById?: string | null;
      postedAt?: Date | null;
      lines: {
        accountId: string;
        debit: number;
        credit: number;
        description?: string | null;
      }[];
    },
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<JournalEntry> {
    const number = await this.generateJENumber(tx);
    return tx.journalEntry.create({
      data: {
        number,
        entryDate: data.entryDate,
        description: data.description,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        status: data.status,
        createdById: data.createdById,
        postedById: data.postedById,
        postedAt: data.postedAt,
        lines: {
          create: data.lines.map((l) => ({
            accountId: l.accountId,
            debit: new Prisma.Decimal(l.debit),
            credit: new Prisma.Decimal(l.credit),
            description: l.description,
          })),
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: JournalEntryStatus,
    postedById?: string | null,
    postedAt?: Date | null,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<JournalEntry> {
    return tx.journalEntry.update({
      where: { id },
      data: {
        status,
        postedById,
        postedAt,
      },
    });
  }
}
