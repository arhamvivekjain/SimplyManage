export type ExperienceLevel = 'casual' | 'management' | 'professional';

export type ProfileContext = 'personal' | 'business' | 'accountant';

export interface UserSession {
  username: string;
  isDemo: boolean;
  setupCompleted: boolean;
}

export interface Entity {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'client';
  icon: string;
  baseCurrency: string;
  fiscalYearStart: string; // MM-DD
  fiscalYearEnd: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  description: string;
  balance: number; // Positive means normal balance (Debit for Asset/Expense, Credit for Liab/Eq/Inc)
}

export type BookType =
  | 'Sales Day Book'
  | 'Purchases Day Book'
  | 'Sales Returns'
  | 'Purchases Returns'
  | 'Cash Book'
  | 'Petty Cash Book'
  | 'Bills Receivable'
  | 'Bills Payable'
  | 'General Journal';

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export type TransactionStatus =
  | 'draft'
  | 'ai_interpreted'
  | 'needs_clarification'
  | 'validated'
  | 'posted'
  | 'adjusted'
  | 'voided';

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  txId?: string;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface CanonicalTransaction {
  id: string;
  entityId: string;
  originalInput: string;
  description: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  counterparty: string;
  counterpartyRole: 'supplier' | 'customer' | 'employee' | 'friend' | 'client' | 'other';
  paymentMethod: string;
  transactionType: 'expense' | 'income' | 'transfer' | 'receivable' | 'payable' | 'refund';
  isAsset?: boolean;
  status: TransactionStatus;
  clarificationQuestion?: string;
  absurdValueWarning?: string;
  journalLines: JournalLine[];
  relevantBook: BookType;
  explanation: string;
  relatedTransactionId?: string;
  invoiceNumber?: string;
  tags?: string[];
  timeline: Array<{ timestamp: string; label: string; note?: string }>;
  comments: Comment[];
  auditHistory: AuditEvent[];
}

export interface Person {
  id: string;
  entityId: string;
  name: string;
  role: 'customer' | 'supplier' | 'friend' | 'client' | 'other';
  email?: string;
  phone?: string;
  theyOweYou: number;
  youOweThem: number;
  currency: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  entityId: string;
  invoiceNumber: string;
  counterparty: string;
  description: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  issueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
  currency: string;
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  type: AccountType;
  debit: number;
  credit: number;
}

export interface AccountingHealth {
  isBalanced: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  clarificationItemsCount: number;
  potentialDuplicatesCount: number;
  reconciled: boolean;
}
