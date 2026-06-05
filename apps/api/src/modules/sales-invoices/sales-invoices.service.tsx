/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SalesInvoicesRepository } from './sales-invoices.repository';
import { ListSalesInvoicesQueryDto } from './dto/list-sales-invoices-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { PaginatedResponse } from '@growflow/types';
import { SalesInvoiceStatus, SalesOrderStatus, SalesCreditNoteStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JournalEntriesService } from '../accounting/journal-entries/journal-entries.service';

@Injectable()
export class SalesInvoicesService {
  constructor(
    private readonly repository: SalesInvoicesRepository,
    private readonly prisma: PrismaService,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  private mapToResponse(invoice: any): any {
    return {
      id: invoice.id,
      number: invoice.number,
      salesOrderId: invoice.salesOrderId,
      customerId: invoice.customerId,
      status: invoice.status,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paymentTermsDays: invoice.paymentTermsDays,
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      note: invoice.note,
      sentAt: invoice.sentAt ? invoice.sentAt.toISOString() : null,
      createdById: invoice.createdById,
      deletedAt: invoice.deletedAt ? invoice.deletedAt.toISOString() : null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      customer: invoice.customer,
      salesOrder: invoice.salesOrder,
      lineItems: invoice.lineItems?.map((li: any) => ({
        id: li.id,
        salesInvoiceId: li.salesInvoiceId,
        soLineItemId: li.soLineItemId,
        itemId: li.itemId,
        qty: li.qty,
        unitPrice: Number(li.unitPrice),
        totalPrice: Number(li.totalPrice),
        item: li.item,
      })),
      payments: invoice.payments?.map((p: any) => ({
        id: p.id,
        salesInvoiceId: p.salesInvoiceId,
        amount: Number(p.amount),
        paymentDate: p.paymentDate.toISOString(),
        note: p.note,
        recordedById: p.recordedById,
        createdAt: p.createdAt.toISOString(),
      })),
      creditNotes: invoice.creditNotes?.map((cn: any) => ({
        id: cn.id,
        number: cn.number,
        salesInvoiceId: cn.salesInvoiceId,
        status: cn.status,
        amount: Number(cn.amount),
        reason: cn.reason,
        note: cn.note,
        issuedAt: cn.issuedAt ? cn.issuedAt.toISOString() : null,
        createdById: cn.createdById,
        createdAt: cn.createdAt.toISOString(),
      })),
    };
  }

  async findAll(query: ListSalesInvoicesQueryDto): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [invoices, total] = await this.repository.findAll(query, skip, limit);

    return {
      data: invoices.map((inv) => this.mapToResponse(inv)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<any> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }
    return this.mapToResponse(invoice);
  }

  async send(id: string): Promise<any> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }

    if (invoice.status !== SalesInvoiceStatus.DRAFT) {
      throw new BadRequestException(`Only DRAFT invoices can be sent`);
    }

    const settings = await this.prisma.accountingSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new BadRequestException('Accounting Settings default COA mapping is not configured.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.salesInvoice.update({
        where: { id },
        data: {
          status: SalesInvoiceStatus.SENT,
          sentAt: new Date(),
        },
      });

      await this.journalEntriesService.createAutoJournal(
        {
          entryDate: new Date(),
          description: `Auto Journal for Sales Invoice ${invoice.number}`,
          sourceType: 'SALES_INVOICE',
          sourceId: invoice.id,
          lines: [
            {
              accountId: settings.arAccountId,
              debit: Number(invoice.totalAmount),
              credit: 0,
              description: `Piutang Dagang - Invoice ${invoice.number}`,
            },
            {
              accountId: settings.revenueAccountId,
              debit: 0,
              credit: Number(invoice.totalAmount),
              description: `Pendapatan Penjualan - Invoice ${invoice.number}`,
            },
          ],
        },
        tx,
      );
    });

    return this.findOne(id);
  }

  async recordPayment(id: string, dto: RecordPaymentDto, userId: string): Promise<any> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }

    if (invoice.status === SalesInvoiceStatus.DRAFT || invoice.status === SalesInvoiceStatus.CANCELLED) {
      throw new BadRequestException(`Cannot record payment for DRAFT or CANCELLED invoice`);
    }

    const totalAmount = Number(invoice.totalAmount);
    const paidAmount = Number(invoice.paidAmount);

    // Hitung sisa tagihan dikurangi Credit Notes yang aktif
    const appliedCreditNotesSum = invoice.creditNotes
      ?.filter((cn: any) => cn.status === SalesCreditNoteStatus.APPLIED)
      ?.reduce((sum: number, cn: any) => sum + Number(cn.amount), 0) ?? 0;

    const outstanding = totalAmount - paidAmount - appliedCreditNotesSum;

    if (dto.amount > outstanding) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds outstanding balance (${outstanding})`,
      );
    }

    const settings = await this.prisma.accountingSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      throw new BadRequestException('Accounting Settings default COA mapping is not configured.');
    }

    const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();

    await this.prisma.$transaction(async (tx) => {
      // Record payment transaction
      const payment = await tx.salesInvoicePayment.create({
        data: {
          salesInvoiceId: id,
          amount: dto.amount,
          paymentDate,
          note: dto.note,
          recordedById: userId,
        },
      });

      // Update paidAmount
      const newPaidAmount = paidAmount + dto.amount;
      const isFullyPaid = newPaidAmount + appliedCreditNotesSum >= totalAmount;
      const nextStatus = isFullyPaid ? SalesInvoiceStatus.PAID : SalesInvoiceStatus.PARTIAL;

      await tx.salesInvoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status: nextStatus,
        },
      });

      // Jika fully paid, update Sales Order ke CLOSED
      if (isFullyPaid) {
        await tx.salesOrder.update({
          where: { id: invoice.salesOrderId },
          data: { status: SalesOrderStatus.CLOSED },
        });
      }

      // Post double-entry journal entry for AR Payment
      await this.journalEntriesService.createAutoJournal(
        {
          entryDate: paymentDate,
          description: `Auto Journal for AR Payment on Invoice ${invoice.number}`,
          sourceType: 'AR_PAYMENT',
          sourceId: payment.id,
          lines: [
            {
              accountId: settings.cashAccountId,
              debit: dto.amount,
              credit: 0,
              description: `Penerimaan Pembayaran - Invoice ${invoice.number}`,
            },
            {
              accountId: settings.arAccountId,
              debit: 0,
              credit: dto.amount,
              description: `Kredit Piutang - Invoice ${invoice.number}`,
            },
          ],
        },
        tx,
      );
    });

    return this.findOne(id);
  }

  async createCreditNote(id: string, dto: CreateCreditNoteDto, userId: string): Promise<any> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }

    if (invoice.status === SalesInvoiceStatus.DRAFT || invoice.status === SalesInvoiceStatus.CANCELLED) {
      throw new BadRequestException(`Cannot apply credit note to DRAFT or CANCELLED invoice`);
    }

    const totalAmount = Number(invoice.totalAmount);
    const paidAmount = Number(invoice.paidAmount);
    const appliedCreditNotesSum = invoice.creditNotes
      ?.filter((cn: any) => cn.status === SalesCreditNoteStatus.APPLIED)
      ?.reduce((sum: number, cn: any) => sum + Number(cn.amount), 0) ?? 0;

    const outstanding = totalAmount - paidAmount - appliedCreditNotesSum;

    if (dto.amount > outstanding) {
      throw new BadRequestException(
        `Credit Note amount (${dto.amount}) exceeds outstanding balance (${outstanding})`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const cnNumber = await this.repository.generateCNNumber(tx);

      // Create credit note
      await tx.salesCreditNote.create({
        data: {
          number: cnNumber,
          salesInvoiceId: id,
          amount: dto.amount,
          reason: dto.reason,
          note: dto.note,
          status: SalesCreditNoteStatus.APPLIED,
          issuedAt: new Date(),
          createdById: userId,
        },
      });

      // Cek jika outstanding sekarang menjadi 0
      const isFullyPaid = paidAmount + appliedCreditNotesSum + dto.amount >= totalAmount;
      if (isFullyPaid) {
        await tx.salesInvoice.update({
          where: { id },
          data: { status: SalesInvoiceStatus.PAID },
        });

        await tx.salesOrder.update({
          where: { id: invoice.salesOrderId },
          data: { status: SalesOrderStatus.CLOSED },
        });
      }
    });

    return this.findOne(id);
  }

  async cancel(id: string): Promise<any> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }

    if (invoice.status === SalesInvoiceStatus.PAID || invoice.status === SalesInvoiceStatus.CANCELLED) {
      throw new BadRequestException(`Cannot cancel invoice with status ${invoice.status}`);
    }

    if (Number(invoice.paidAmount) > 0) {
      throw new BadRequestException(`Cannot cancel invoice because payments have been recorded`);
    }

    await this.repository.updateStatus(id, SalesInvoiceStatus.CANCELLED);
    return this.findOne(id);
  }

  async generatePdfStream(invoice: any): Promise<NodeJS.ReadableStream> {
    const { renderToStream } = await import('@react-pdf/renderer');
    const { SalesInvoicePdf } = await import('./pdf-template');
    
    return renderToStream(<SalesInvoicePdf invoice={invoice} />);
  }
}
