export interface AccountSeed {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category:
    | 'CURRENT_ASSET'
    | 'FIXED_ASSET'
    | 'CURRENT_LIABILITY'
    | 'LONG_TERM_LIABILITY'
    | 'EQUITY'
    | 'REVENUE'
    | 'COGS'
    | 'OPERATING_EXPENSE'
    | 'OTHER_EXPENSE'
    | 'OTHER_INCOME';
  parentCode?: string;
  isSystemAccount?: boolean;
}

export const coaData: AccountSeed[] = [
  // 1-0000 ASET
  { code: '1-0000', name: 'Aset', type: 'ASSET', category: 'CURRENT_ASSET' },
  { code: '1-1000', name: 'Aset Lancar', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-0000' },
  { code: '1-1100', name: 'Kas dan Setara Kas', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1000' },
  { code: '1-1110', name: 'Kas Kecil', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1100' },
  { code: '1-1120', name: 'Kas di Tangan', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1100' },
  { code: '1-1200', name: 'Bank default', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1100', isSystemAccount: true },
  { code: '1-1210', name: 'Bank Mandiri', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1100' },
  { code: '1-1220', name: 'Bank BCA', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1100' },
  { code: '1-1300', name: 'Piutang Usaha', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1000', isSystemAccount: true },
  { code: '1-1310', name: 'Piutang Dagang', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1300' },
  { code: '1-1400', name: 'Persediaan Barang Dagang', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1000', isSystemAccount: true },
  { code: '1-1500', name: 'Uang Muka Pembelian', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1000' },
  { code: '1-1600', name: 'Pajak Dibayar di Muka (VAT In)', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1000' },
  { code: '1-1700', name: 'Biaya Dibayar di Muka', type: 'ASSET', category: 'CURRENT_ASSET', parentCode: '1-1000' },

  // Aset Tetap
  { code: '1-2000', name: 'Aset Tetap', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-0000' },
  { code: '1-2100', name: 'Tanah', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2000' },
  { code: '1-2200', name: 'Bangunan', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2000' },
  { code: '1-2210', name: 'Akumulasi Penyusutan Bangunan', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2200' },
  { code: '1-2300', name: 'Kendaraan', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2000' },
  { code: '1-2310', name: 'Akumulasi Penyusutan Kendaraan', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2300' },
  { code: '1-2400', name: 'Peralatan Kantor', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2000' },
  { code: '1-2410', name: 'Akumulasi Penyusutan Peralatan', type: 'ASSET', category: 'FIXED_ASSET', parentCode: '1-2400' },

  // 2-0000 KEWAJIBAN
  { code: '2-0000', name: 'Kewajiban', type: 'LIABILITY', category: 'CURRENT_LIABILITY' },
  { code: '2-1000', name: 'Kewajiban Jangka Pendek', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-0000' },
  { code: '2-1100', name: 'Hutang Usaha', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-1000', isSystemAccount: true },
  { code: '2-1110', name: 'Hutang Dagang', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-1100' },
  { code: '2-1200', name: 'Uang Muka Penjualan', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-1000' },
  { code: '2-1300', name: 'Hutang Pajak (VAT Out)', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-1000' },
  { code: '2-1400', name: 'Beban yang Masih Harus Dibayar', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-1000' },
  { code: '2-1500', name: 'Hutang Gaji', type: 'LIABILITY', category: 'CURRENT_LIABILITY', parentCode: '2-1000' },
  { code: '2-2000', name: 'Kewajiban Jangka Panjang', type: 'LIABILITY', category: 'LONG_TERM_LIABILITY', parentCode: '2-0000' },
  { code: '2-2100', name: 'Hutang Bank Jangka Panjang', type: 'LIABILITY', category: 'LONG_TERM_LIABILITY', parentCode: '2-2000' },

  // 3-0000 EKUITAS
  { code: '3-0000', name: 'Ekuitas', type: 'EQUITY', category: 'EQUITY' },
  { code: '3-1000', name: 'Modal Saham', type: 'EQUITY', category: 'EQUITY', parentCode: '3-0000' },
  { code: '3-2000', name: 'Tambahan Modal Disetor', type: 'EQUITY', category: 'EQUITY', parentCode: '3-0000' },
  { code: '3-3000', name: 'Saldo Laba (Laba Ditahan)', type: 'EQUITY', category: 'EQUITY', parentCode: '3-0000' },
  { code: '3-9000', name: 'Ikhtisar Laba Rugi', type: 'EQUITY', category: 'EQUITY', parentCode: '3-0000' },

  // 4-0000 PENDAPATAN
  { code: '4-0000', name: 'Pendapatan', type: 'REVENUE', category: 'REVENUE' },
  { code: '4-1000', name: 'Pendapatan Usaha', type: 'REVENUE', category: 'REVENUE', parentCode: '4-0000' },
  { code: '4-1100', name: 'Pendapatan Penjualan', type: 'REVENUE', category: 'REVENUE', parentCode: '4-1000', isSystemAccount: true },
  { code: '4-1200', name: 'Retur Penjualan', type: 'REVENUE', category: 'REVENUE', parentCode: '4-1000' },
  { code: '4-1300', name: 'Potongan Penjualan', type: 'REVENUE', category: 'REVENUE', parentCode: '4-1000' },

  // 5-0000 BEBAN (HPP & BEBAN OPERASIONAL)
  { code: '5-0000', name: 'Harga Pokok Penjualan', type: 'EXPENSE', category: 'COGS' },
  { code: '5-1000', name: 'Beban Pokok Penjualan (COGS)', type: 'EXPENSE', category: 'COGS', parentCode: '5-0000', isSystemAccount: true },
  { code: '5-2000', name: 'Beban Pembelian default', type: 'EXPENSE', category: 'COGS', parentCode: '5-0000', isSystemAccount: true },

  { code: '6-0000', name: 'Beban Operasional', type: 'EXPENSE', category: 'OPERATING_EXPENSE' },
  { code: '6-1000', name: 'Beban Gaji & Tunjangan', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },
  { code: '6-2000', name: 'Beban Penyusutan', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },
  { code: '6-3000', name: 'Beban Air, Listrik & Telepon', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },
  { code: '6-4000', name: 'Beban Sewa', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },
  { code: '6-5000', name: 'Beban Perlengkapan Kantor', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },
  { code: '6-6000', name: 'Beban Pemasaran', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },
  { code: '6-9000', name: 'Beban Operasional Lain-lain', type: 'EXPENSE', category: 'OPERATING_EXPENSE', parentCode: '6-0000' },

  // Pendapatan & Beban Non-Operasional
  { code: '7-0000', name: 'Pendapatan Lain-lain', type: 'REVENUE', category: 'OTHER_INCOME' },
  { code: '7-1000', name: 'Pendapatan Bunga Jasa Giro', type: 'REVENUE', category: 'OTHER_INCOME', parentCode: '7-0000' },
  { code: '8-0000', name: 'Beban Lain-lain', type: 'EXPENSE', category: 'OTHER_EXPENSE' },
  { code: '8-1000', name: 'Beban Administrasi Bank', type: 'EXPENSE', category: 'OTHER_EXPENSE', parentCode: '8-0000' },
  { code: '8-2000', name: 'Beban Bunga Pinjaman', type: 'EXPENSE', category: 'OTHER_EXPENSE', parentCode: '8-0000' },
  { code: '8-3000', name: 'Kerugian Selisih Kurs', type: 'EXPENSE', category: 'OTHER_EXPENSE', parentCode: '8-0000' }
];
