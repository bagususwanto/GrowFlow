export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type AccountCategory =
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

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId: string | null;
  isSystemAccount: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    code: string;
    name: string;
  } | null;
  children?: Account[];
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  account?: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
  };
}

export interface JournalEntry {
  id: string;
  number: string;
  entryDate: string;
  description: string | null;
  sourceType: string | null;
  sourceId: string | null;
  status: JournalEntryStatus;
  postedAt: string | null;
  postedById: string | null;
  createdById: string | null;
  lines?: JournalLine[];
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
  } | null;
  postedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface AccountingSettings {
  id: string;
  apAccountId: string;
  arAccountId: string;
  cashAccountId: string;
  inventoryAccountId: string;
  cogsAccountId: string;
  revenueAccountId: string;
  purchaseAccountId: string;
  updatedAt: string;
  apAccount?: Account;
  arAccount?: Account;
  cashAccount?: Account;
  inventoryAccount?: Account;
  cogsAccount?: Account;
  revenueAccount?: Account;
  purchaseAccount?: Account;
}

export interface CreateAccountRequest {
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string | null;
  isActive?: boolean;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  category?: AccountCategory;
  parentId?: string | null;
  isActive?: boolean;
}

export interface CreateJournalEntryRequest {
  entryDate?: string;
  description?: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
  }[];
}

export interface UpdateAccountingSettingsRequest {
  apAccountId?: string;
  arAccountId?: string;
  cashAccountId?: string;
  inventoryAccountId?: string;
  cogsAccountId?: string;
  revenueAccountId?: string;
  purchaseAccountId?: string;
}

export interface TrialBalanceItem {
  account: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    category: AccountCategory;
  };
  totalDebit: number;
  totalCredit: number;
  balance: number; // Positive for normal balance, negative for reverse balance
}

export interface ProfitLossReport {
  revenues: {
    id: string;
    code: string;
    name: string;
    amount: number;
  }[];
  expenses: {
    id: string;
    code: string;
    name: string;
    amount: number;
  }[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface AgingBucketItem {
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  current: number;
  bucket1To30: number;
  bucket31To60: number;
  bucket61To90: number;
  bucketOver90: number;
  total: number;
}

export interface AgingReport {
  asOf: string;
  items: AgingBucketItem[];
  totals: {
    current: number;
    bucket1To30: number;
    bucket31To60: number;
    bucket61To90: number;
    bucketOver90: number;
    total: number;
  };
}
