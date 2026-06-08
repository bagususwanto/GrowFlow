import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { JournalEntriesRepository } from './journal-entries.repository';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ListJournalEntriesQueryDto } from './dto/list-journal-entries-query.dto';
import { JournalEntry as SharedJournalEntry, PaginatedResponse, JournalEntryStatus, AccountType } from '@growflow/types';
import { JournalEntry, JournalLine, Prisma } from '@prisma/client';

@Injectable()
export class JournalEntriesService {
  constructor(private readonly journalEntriesRepository: JournalEntriesRepository) {}

  private mapToResponse(
    je: JournalEntry & {
      createdBy?: { id: string; name: string } | null;
      postedBy?: { id: string; name: string } | null;
      lines?: (JournalLine & {
        account?: { id: string; code: string; name: string; type: string };
      })[];
    },
  ): SharedJournalEntry {
    return {
      id: je.id,
      number: je.number,
      entryDate: je.entryDate.toISOString(),
      description: je.description,
      sourceType: je.sourceType,
      sourceId: je.sourceId,
      status: je.status as JournalEntryStatus,
      postedAt: je.postedAt ? je.postedAt.toISOString() : null,
      postedById: je.postedById,
      createdById: je.createdById,
      createdAt: je.createdAt.toISOString(),
      updatedAt: je.updatedAt.toISOString(),
      createdBy: je.createdBy
        ? {
            id: je.createdBy.id,
            name: je.createdBy.name,
          }
        : null,
      postedBy: je.postedBy
        ? {
            id: je.postedBy.id,
            name: je.postedBy.name,
          }
        : null,
      lines: je.lines
        ? je.lines.map((l) => ({
            id: l.id,
            journalEntryId: l.journalEntryId,
            accountId: l.accountId,
            debit: Number(l.debit),
            credit: Number(l.credit),
            description: l.description,
            createdAt: l.createdAt.toISOString(),
            updatedAt: l.updatedAt.toISOString(),
            account: l.account
              ? {
                  id: l.account.id,
                  code: l.account.code,
                  name: l.account.name,
                  type: l.account.type as AccountType,
                }
              : undefined,
          }))
        : [],
    };
  }

  private validateBalance(lines: { debit: number; credit: number }[]) {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      if (line.debit < 0 || line.credit < 0) {
        throw new BadRequestException('Debit and credit amounts must be non-negative');
      }
      totalDebit += line.debit;
      totalCredit += line.credit;
    }

    // Floating point comparison with margin
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new UnprocessableEntityException(
        `Journal entry is not balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`,
      );
    }

    if (totalDebit <= 0) {
      throw new BadRequestException('Journal entry must have a total amount greater than zero');
    }
  }

  async findAll(query: ListJournalEntriesQueryDto): Promise<PaginatedResponse<SharedJournalEntry>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [entries, total] = await this.journalEntriesRepository.findAll(query, skip, limit);

    return {
      data: entries.map((e) => this.mapToResponse(e)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<SharedJournalEntry> {
    const entry = await this.journalEntriesRepository.findById(id);
    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }
    return this.mapToResponse(entry);
  }

  async createManual(dto: CreateJournalEntryDto, createdById: string): Promise<SharedJournalEntry> {
    this.validateBalance(dto.lines);

    const entry = await this.journalEntriesRepository.create({
      entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
      description: dto.description || null,
      sourceType: 'MANUAL',
      sourceId: null,
      status: 'DRAFT',
      createdById,
      lines: dto.lines,
    });

    const fullEntry = await this.journalEntriesRepository.findById(entry.id);
    return this.mapToResponse(fullEntry!);
  }

  async createAutoJournal(
    params: {
      entryDate: Date;
      description?: string | null;
      sourceType: string;
      sourceId: string;
      lines: {
        accountId: string;
        debit: number;
        credit: number;
        description?: string | null;
      }[];
    },
    tx?: Prisma.TransactionClient,
  ): Promise<JournalEntry> {
    this.validateBalance(params.lines);

    return this.journalEntriesRepository.create(
      {
        entryDate: params.entryDate,
        description: params.description,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        status: 'POSTED',
        postedById: null, // system generated
        postedAt: new Date(),
        lines: params.lines,
      },
      tx,
    );
  }

  async post(id: string, userId: string): Promise<SharedJournalEntry> {
    const entry = await this.journalEntriesRepository.findById(id);
    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }

    if (entry.status !== 'DRAFT') {
      throw new BadRequestException(`Only DRAFT journal entries can be posted. Current status: ${entry.status}`);
    }

    await this.journalEntriesRepository.updateStatus(id, 'POSTED', userId, new Date());
    const updated = await this.journalEntriesRepository.findById(id);
    return this.mapToResponse(updated!);
  }

  async cancel(id: string): Promise<SharedJournalEntry> {
    const entry = await this.journalEntriesRepository.findById(id);
    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }

    if (entry.status !== 'DRAFT') {
      throw new BadRequestException(`Only DRAFT journal entries can be cancelled. Current status: ${entry.status}`);
    }

    await this.journalEntriesRepository.updateStatus(id, 'CANCELLED', null, null);
    const updated = await this.journalEntriesRepository.findById(id);
    return this.mapToResponse(updated!);
  }
}
