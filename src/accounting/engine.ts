import {
  CanonicalTransaction,
  Account,
  BookType,
  TrialBalanceItem,
  AccountingHealth,
  AuditEvent,
} from '../types';

export class AccountingEngine {
  /**
   * Validates double-entry invariant: Sum(Debits) === Sum(Credits)
   */
  static validateDoubleEntry(transaction: CanonicalTransaction): { isValid: boolean; debits: number; credits: number; error?: string } {
    if (!transaction.journalLines || transaction.journalLines.length === 0) {
      return { isValid: false, debits: 0, credits: 0, error: 'Transaction has no journal lines' };
    }

    const totalDebits = transaction.journalLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = transaction.journalLines.reduce((sum, line) => sum + (line.credit || 0), 0);

    // Tolerance for floating point precision issues
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;

    if (!isBalanced) {
      return {
        isValid: false,
        debits: totalDebits,
        credits: totalCredits,
        error: `Double-entry invariant failed: Debits (${totalDebits}) must equal Credits (${totalCredits})`,
      };
    }

    return { isValid: true, debits: totalDebits, credits: totalCredits };
  }

  /**
   * Detects duplicate transactions
   */
  static detectDuplicate(
    candidate: Partial<CanonicalTransaction>,
    existing: CanonicalTransaction[]
  ): CanonicalTransaction | null {
    if (!candidate.amount) return null;

    return (
      existing.find((tx) => {
        if (candidate.id && tx.id === candidate.id) return false;
        if (tx.status === 'voided') return false;

        const sameAmount = Math.abs(tx.amount - candidate.amount!) < 0.01;
        const sameCounterparty =
          candidate.counterparty &&
          tx.counterparty.toLowerCase().trim() === candidate.counterparty.toLowerCase().trim();
        const sameDesc =
          candidate.description &&
          tx.description.toLowerCase().trim() === candidate.description.toLowerCase().trim();
        const sameDate = candidate.date && tx.date === candidate.date;

        return sameAmount && (sameCounterparty || sameDesc) && (sameDate || !candidate.date);
      }) || null
    );
  }

  /**
   * Assigns appropriate Book of Prime Entry
   */
  static determineBook(tx: Partial<CanonicalTransaction>): BookType {
    const type = tx.transactionType;
    const payment = (tx.paymentMethod || '').toLowerCase();
    const isCashOrBank = payment.includes('cash') || payment.includes('nbd') || payment.includes('bank');

    if (type === 'refund') {
      return 'Purchases Returns';
    }
    if (type === 'income' && !isCashOrBank) {
      return 'Sales Day Book';
    }
    if (type === 'expense' && !isCashOrBank) {
      return 'Purchases Day Book';
    }
    if (type === 'receivable') {
      return 'Sales Day Book';
    }
    if (type === 'payable') {
      return 'Purchases Day Book';
    }
    if (isCashOrBank) {
      if (payment.includes('petty')) return 'Petty Cash Book';
      return 'Cash Book';
    }
    return 'General Journal';
  }

  /**
   * Posts canonical transaction to ledgers and updates account balances
   */
  static applyTransactionToAccounts(
    tx: CanonicalTransaction,
    currentAccounts: Account[]
  ): { updatedAccounts: Account[]; auditLog: AuditEvent } {
    const accountsMap = new Map<string, Account>(
      currentAccounts.map((a) => [a.name.toLowerCase(), { ...a }])
    );

    for (const line of tx.journalLines) {
      const key = line.accountName.toLowerCase();
      let account = accountsMap.get(key);

      // Create account dynamically if not present
      if (!account) {
        account = {
          code: `${Math.floor(1000 + Math.random() * 8000)}`,
          name: line.accountName,
          type: line.debit > 0 ? 'asset' : 'income',
          description: `Auto-registered from transaction ${tx.id}`,
          balance: 0,
        };
        accountsMap.set(key, account);
      }

      // In accounting:
      // Asset / Expense: normal Debit balance (Debit increases +, Credit decreases -)
      // Liability / Equity / Income: normal Credit balance (Credit increases +, Debit decreases -)
      if (account.type === 'asset' || account.type === 'expense') {
        account.balance += (line.debit || 0) - (line.credit || 0);
      } else {
        account.balance += (line.credit || 0) - (line.debit || 0);
      }
    }

    const auditLog: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action: 'TRANSACTION_POSTED',
      actor: 'Accounting Engine',
      details: `Posted canonical transaction ${tx.id}: ${tx.description} (${tx.currency} ${tx.amount}). Books and ledgers synchronized.`,
      txId: tx.id,
    };

    return {
      updatedAccounts: Array.from(accountsMap.values()),
      auditLog,
    };
  }

  /**
   * Calculates Trial Balance strictly from accounts / posted lines
   */
  static generateTrialBalance(accounts: Account[], transactions: CanonicalTransaction[]): {
    items: TrialBalanceItem[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
  } {
    // Accumulate all debits and credits from posted canonical transactions
    const accountDebits = new Map<string, number>();
    const accountCredits = new Map<string, number>();

    const postedTx = transactions.filter((t) => t.status === 'posted');

    for (const tx of postedTx) {
      for (const line of tx.journalLines) {
        const name = line.accountName;
        accountDebits.set(name, (accountDebits.get(name) || 0) + (line.debit || 0));
        accountCredits.set(name, (accountCredits.get(name) || 0) + (line.credit || 0));
      }
    }

    // Combine with all accounts in chart of accounts
    const allAccountNames = Array.from(
      new Set([...accounts.map((a) => a.name), ...Array.from(accountDebits.keys())])
    );

    let totalDebits = 0;
    let totalCredits = 0;

    const items: TrialBalanceItem[] = allAccountNames.map((name) => {
      const acc = accounts.find((a) => a.name.toLowerCase() === name.toLowerCase());
      const type = acc ? acc.type : 'asset';
      const code = acc ? acc.code : '—';

      const d = accountDebits.get(name) || 0;
      const c = accountCredits.get(name) || 0;

      totalDebits += d;
      totalCredits += c;

      return {
        accountCode: code,
        accountName: name,
        type,
        debit: d,
        credit: c,
      };
    });

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return {
      items,
      totalDebits,
      totalCredits,
      isBalanced,
    };
  }

  /**
   * Computes overall Accounting Health
   */
  static assessAccountingHealth(
    accounts: Account[],
    transactions: CanonicalTransaction[]
  ): AccountingHealth {
    const tb = this.generateTrialBalance(accounts, transactions);
    const clarificationItems = transactions.filter(
      (t) => t.status === 'needs_clarification' || Boolean(t.clarificationQuestion)
    );

    // Simple duplicate check
    let duplicates = 0;
    for (let i = 0; i < transactions.length; i++) {
      for (let j = i + 1; j < transactions.length; j++) {
        const a = transactions[i];
        const b = transactions[j];
        if (
          a.amount === b.amount &&
          a.counterparty.toLowerCase() === b.counterparty.toLowerCase() &&
          a.date === b.date &&
          a.status === 'posted' &&
          b.status === 'posted'
        ) {
          duplicates++;
        }
      }
    }

    return {
      isBalanced: tb.isBalanced,
      totalDebits: tb.totalDebits,
      totalCredits: tb.totalCredits,
      difference: Math.abs(tb.totalDebits - tb.totalCredits),
      clarificationItemsCount: clarificationItems.length,
      potentialDuplicatesCount: duplicates,
      reconciled: tb.isBalanced && duplicates === 0,
    };
  }
}
