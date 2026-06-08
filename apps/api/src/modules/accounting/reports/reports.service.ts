import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { TrialBalanceItem, ProfitLossReport, AgingReport, AgingBucketItem, AccountType, AccountCategory } from '@growflow/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrialBalance(startDate?: string, endDate?: string): Promise<TrialBalanceItem[]> {
    const whereClause: Prisma.JournalEntryWhereInput = {
      status: 'POSTED',
    };

    if (startDate || endDate) {
      whereClause.entryDate = {};
      if (startDate) {
        whereClause.entryDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.entryDate.lte = new Date(endDate);
      }
    }

    // Fetch all accounts to ensure we list accounts even with 0 balances
    const accounts = await this.prisma.account.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    });

    const lines = await this.prisma.journalLine.findMany({
      where: {
        journalEntry: whereClause,
      },
    });

    const tbMap = new Map<string, { totalDebit: number; totalCredit: number }>();
    for (const acc of accounts) {
      tbMap.set(acc.id, { totalDebit: 0, totalCredit: 0 });
    }

    for (const line of lines) {
      const cur = tbMap.get(line.accountId) || { totalDebit: 0, totalCredit: 0 };
      tbMap.set(line.accountId, {
        totalDebit: cur.totalDebit + Number(line.debit),
        totalCredit: cur.totalCredit + Number(line.credit),
      });
    }

    return accounts.map((acc) => {
      const { totalDebit, totalCredit } = tbMap.get(acc.id) || { totalDebit: 0, totalCredit: 0 };
      
      // Calculate normal balance:
      // ASSET and EXPENSE: Debit - Credit
      // LIABILITY, EQUITY, REVENUE: Credit - Debit
      const isNormalDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
      const balance = isNormalDebit ? totalDebit - totalCredit : totalCredit - totalDebit;

      return {
        account: {
          id: acc.id,
          code: acc.code,
          name: acc.name,
          type: acc.type as AccountType,
          category: acc.category as AccountCategory,
        },
        totalDebit,
        totalCredit,
        balance,
      };
    });
  }

  async getProfitLoss(startDate?: string, endDate?: string): Promise<ProfitLossReport> {
    const whereClause: Prisma.JournalEntryWhereInput = {
      status: 'POSTED',
    };

    if (startDate || endDate) {
      whereClause.entryDate = {};
      if (startDate) {
        whereClause.entryDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.entryDate.lte = new Date(endDate);
      }
    }

    const lines = await this.prisma.journalLine.findMany({
      where: {
        journalEntry: whereClause,
        account: {
          type: { in: ['REVENUE', 'EXPENSE'] },
        },
      },
      include: {
        account: true,
      },
    });

    const revenueMap = new Map<string, { code: string; name: string; debit: number; credit: number }>();
    const expenseMap = new Map<string, { code: string; name: string; debit: number; credit: number }>();

    for (const line of lines) {
      const acc = line.account;
      if (acc.type === 'REVENUE') {
        const cur = revenueMap.get(acc.id) || { code: acc.code, name: acc.name, debit: 0, credit: 0 };
        revenueMap.set(acc.id, {
          ...cur,
          debit: cur.debit + Number(line.debit),
          credit: cur.credit + Number(line.credit),
        });
      } else if (acc.type === 'EXPENSE') {
        const cur = expenseMap.get(acc.id) || { code: acc.code, name: acc.name, debit: 0, credit: 0 };
        expenseMap.set(acc.id, {
          ...cur,
          debit: cur.debit + Number(line.debit),
          credit: cur.credit + Number(line.credit),
        });
      }
    }

    const revenuesList: ProfitLossReport['revenues'] = [];
    let totalRevenue = 0;
    revenueMap.forEach((val, id) => {
      const amount = val.credit - val.debit; // Normal credit balance
      revenuesList.push({ id, code: val.code, name: val.name, amount });
      totalRevenue += amount;
    });

    const expensesList: ProfitLossReport['expenses'] = [];
    let totalExpense = 0;
    expenseMap.forEach((val, id) => {
      const amount = val.debit - val.credit; // Normal debit balance
      expensesList.push({ id, code: val.code, name: val.name, amount });
      totalExpense += amount;
    });

    // Sort by code
    revenuesList.sort((a, b) => a.code.localeCompare(b.code));
    expensesList.sort((a, b) => a.code.localeCompare(b.code));

    return {
      revenues: revenuesList,
      expenses: expensesList,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
    };
  }

  async getAPAging(asOfStr?: string): Promise<AgingReport> {
    const asOf = asOfStr ? new Date(asOfStr) : new Date();

    const invoices = await this.prisma.vendorInvoice.findMany({
      where: {
        deletedAt: null,
        status: { in: ['RECEIVED', 'PARTIAL'] },
        invoiceDate: { lte: asOf },
      },
      include: {
        supplier: true,
      },
    });

    const supplierBuckets = new Map<string, AgingBucketItem & { supplierCode: string; supplierName: string }>();

    for (const inv of invoices) {
      const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
      if (outstanding <= 0) continue;

      const daysLate = Math.floor((asOf.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const sup = inv.supplier;
      const cur = supplierBuckets.get(sup.id) || {
        partnerId: sup.id,
        partnerCode: sup.code,
        partnerName: sup.name,
        supplierCode: sup.code,
        supplierName: sup.name,
        current: 0,
        bucket1To30: 0,
        bucket31To60: 0,
        bucket61To90: 0,
        bucketOver90: 0,
        total: 0,
      };

      if (daysLate <= 0) {
        cur.current += outstanding;
      } else if (daysLate <= 30) {
        cur.bucket1To30 += outstanding;
      } else if (daysLate <= 60) {
        cur.bucket31To60 += outstanding;
      } else if (daysLate <= 90) {
        cur.bucket61To90 += outstanding;
      } else {
        cur.bucketOver90 += outstanding;
      }
      cur.total += outstanding;
      supplierBuckets.set(sup.id, cur);
    }

    const items = Array.from(supplierBuckets.values());
    items.sort((a, b) => a.supplierCode.localeCompare(b.supplierCode));

    const totals = {
      current: 0,
      bucket1To30: 0,
      bucket31To60: 0,
      bucket61To90: 0,
      bucketOver90: 0,
      total: 0,
    };

    for (const item of items) {
      totals.current += item.current;
      totals.bucket1To30 += item.bucket1To30;
      totals.bucket31To60 += item.bucket31To60;
      totals.bucket61To90 += item.bucket61To90;
      totals.bucketOver90 += item.bucketOver90;
      totals.total += item.total;
    }

    return {
      asOf: asOf.toISOString(),
      items,
      totals,
    };
  }

  async getARAging(asOfStr?: string): Promise<AgingReport> {
    const asOf = asOfStr ? new Date(asOfStr) : new Date();

    const invoices = await this.prisma.salesInvoice.findMany({
      where: {
        deletedAt: null,
        status: { in: ['SENT', 'PARTIAL'] },
        invoiceDate: { lte: asOf },
      },
      include: {
        customer: true,
      },
    });

    const customerBuckets = new Map<string, AgingBucketItem & { customerCode: string; customerName: string }>();

    for (const inv of invoices) {
      const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
      if (outstanding <= 0) continue;

      const daysLate = Math.floor((asOf.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const cust = inv.customer;
      const cur = customerBuckets.get(cust.id) || {
        partnerId: cust.id,
        partnerCode: cust.code,
        partnerName: cust.name,
        customerCode: cust.code,
        customerName: cust.name,
        current: 0,
        bucket1To30: 0,
        bucket31To60: 0,
        bucket61To90: 0,
        bucketOver90: 0,
        total: 0,
      };

      if (daysLate <= 0) {
        cur.current += outstanding;
      } else if (daysLate <= 30) {
        cur.bucket1To30 += outstanding;
      } else if (daysLate <= 60) {
        cur.bucket31To60 += outstanding;
      } else if (daysLate <= 90) {
        cur.bucket61To90 += outstanding;
      } else {
        cur.bucketOver90 += outstanding;
      }
      cur.total += outstanding;
      customerBuckets.set(cust.id, cur);
    }

    const items = Array.from(customerBuckets.values());
    items.sort((a, b) => a.customerCode.localeCompare(b.customerCode));

    const totals = {
      current: 0,
      bucket1To30: 0,
      bucket31To60: 0,
      bucket61To90: 0,
      bucketOver90: 0,
      total: 0,
    };

    for (const item of items) {
      totals.current += item.current;
      totals.bucket1To30 += item.bucket1To30;
      totals.bucket31To60 += item.bucket31To60;
      totals.bucket61To90 += item.bucket61To90;
      totals.bucketOver90 += item.bucketOver90;
      totals.total += item.total;
    }

    return {
      asOf: asOf.toISOString(),
      items,
      totals,
    };
  }
}
