import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: '#333333',
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2px solid #E5E7EB',
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'right',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metaBlock: {
    width: '45%',
  },
  label: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#0F172A',
    marginBottom: 2,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0,
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomColor: '#0F172A',
    borderBottomWidth: 2,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    fontWeight: 'bold',
  },
  colNo: { width: '5%', textAlign: 'center' },
  colItem: { width: '50%', paddingLeft: 8 },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBlock: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: '#0F172A',
    borderTopWidth: 1,
    paddingVertical: 6,
    marginTop: 4,
    fontWeight: 'bold',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingTop: 10,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 8,
  },
});

interface SalesInvoicePdfProps {
  invoice: any;
}

export const SalesInvoicePdf: React.FC<SalesInvoicePdfProps> = ({ invoice }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>GrowFlow ERP</Text>
            <Text>Solusi Manajemen Bisnis Terintegrasi</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FAKTUR PENJUALAN</Text>
            <Text style={{ textAlign: 'right', color: '#64748B' }}>No: {invoice.number}</Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metaContainer}>
          <View style={styles.metaBlock}>
            <Text style={styles.label}>Ditagih Ke:</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>{invoice.customer?.name}</Text>
            <Text style={styles.value}>Kode Customer: {invoice.customer?.code}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.label}>Info Faktur:</Text>
            <Text style={styles.value}>Tanggal: {formatDate(invoice.invoiceDate)}</Text>
            <Text style={styles.value}>Jatuh Tempo: {formatDate(invoice.dueDate)}</Text>
            <Text style={styles.value}>Termin: {invoice.paymentTermsDays} Hari</Text>
            <Text style={styles.value}>Status: {invoice.status}</Text>
          </View>
        </View>

        {/* Table Items */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colNo, styles.tableCellHeader]}>No</Text>
            <Text style={[styles.colItem, styles.tableCellHeader]}>Barang</Text>
            <Text style={[styles.colQty, styles.tableCellHeader]}>Qty</Text>
            <Text style={[styles.colPrice, styles.tableCellHeader]}>Harga Satuan</Text>
            <Text style={[styles.colTotal, styles.tableCellHeader]}>Total</Text>
          </View>

          {invoice.lineItems?.map((li: any, idx: number) => (
            <View style={styles.tableRow} key={li.id}>
              <Text style={[styles.colNo, styles.tableCell]}>{idx + 1}</Text>
              <Text style={[styles.colItem, styles.tableCell]}>{li.item?.name || 'N/A'} ({li.item?.code || '-'})</Text>
              <Text style={[styles.colQty, styles.tableCell]}>{li.qty}</Text>
              <Text style={[styles.colPrice, styles.tableCell]}>{formatCurrency(li.unitPrice)}</Text>
              <Text style={[styles.colTotal, styles.tableCell]}>{formatCurrency(li.totalPrice)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={{ color: '#64748B' }}>Total Nilai:</Text>
              <Text>{formatCurrency(invoice.totalAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={{ color: '#64748B' }}>Sudah Dibayar:</Text>
              <Text>{formatCurrency(invoice.paidAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Sisa Tagihan:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(outstanding)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Terima kasih atas kerja sama Anda.</Text>
          <Text style={{ marginTop: 2 }}>Dokumen ini dihasilkan secara otomatis oleh sistem GrowFlow ERP.</Text>
        </View>
      </Page>
    </Document>
  );
};
