import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ExperienceLevel,
  ProfileContext,
  UserSession,
  Entity,
  Account,
  CanonicalTransaction,
  Person,
  Invoice,
  AuditEvent,
  AccountingHealth,
  TrialBalanceItem,
} from '../types';
import { STARTER_ACCOUNTS } from '../accounting/chartOfAccounts';
import { AccountingEngine } from '../accounting/engine';
import {
  SEED_ENTITIES,
  SEED_PEOPLE,
  SEED_INVOICES,
  SEED_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

interface AddTransactionResult {
  success: boolean;
  transaction?: CanonicalTransaction;
  error?: string;
  duplicateWarning?: CanonicalTransaction;
}

interface AccountingContextType {
  // User Session & Authentication
  currentUser: UserSession | null;
  login: (username: string, password?: string) => { success: boolean; isDemo: boolean };
  logout: () => void;
  completeOrganizationSetup: (config: {
    entityName: string;
    entityType: 'personal' | 'business' | 'client';
    baseCurrency: string;
    fiscalYearStart: string;
    taxNumber?: string;
    initialBankBalance?: number;
    initialBankName?: string;
  }) => void;

  // Experience level & Profile Context
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (lvl: ExperienceLevel) => void;
  profileContext: ProfileContext;
  setProfileContext: (ctx: ProfileContext) => void;

  // Active Entity (Tenant Isolation)
  entities: Entity[];
  activeEntity: Entity;
  setActiveEntityId: (id: string) => void;
  addEntity: (entity: Entity) => void;
  updateActiveEntity: (updates: Partial<Entity>) => void;

  // Canonical Records (Scoped to Active Entity)
  transactions: CanonicalTransaction[];
  allTransactions: CanonicalTransaction[];
  accounts: Account[];
  people: Person[];
  invoices: Invoice[];
  auditLogs: AuditEvent[];

  // Double-Entry Accounting State
  accountingHealth: AccountingHealth;
  trialBalance: {
    items: TrialBalanceItem[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
  };

  // Actions
  postCanonicalTransaction: (txData: Partial<CanonicalTransaction>) => AddTransactionResult;
  voidTransaction: (txId: string, reason: string) => boolean;
  addPersonComment: (txId: string, commentText: string) => void;
  updatePersonBalance: (personName: string, deltaOweYou: number, deltaYouOwe: number) => void;
  createInvoice: (invoiceData: Partial<Invoice>) => Invoice;
  recordPaymentForInvoice: (invoiceId: string, amount: number, paymentMethod: string) => boolean;
  addAuditLog: (action: string, details: string, txId?: string) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredTransactions: CanonicalTransaction[];

  // Selected Transaction for Inspection Modal
  selectedTransaction: CanonicalTransaction | null;
  setSelectedTransaction: (tx: CanonicalTransaction | null) => void;

  // Demo walkthrough control
  runDemoStep: (stepNumber: number) => Promise<string>;
  resetToDemoState: () => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const ACTIVE_USER_KEY = 'simplymanage_active_user_v2';
const USERS_VAULT_KEY = 'simplymanage_users_vault_v2';

interface StoredUserData {
  transactions: CanonicalTransaction[];
  accounts: Account[];
  people: Person[];
  invoices: Invoice[];
  auditLogs: AuditEvent[];
  experienceLevel: ExperienceLevel;
  activeEntityId: string;
  entities: Entity[];
}

const getUserDataStorageKey = (username: string): string => {
  return `simplymanage_data_${(username || 'jain').trim().toLowerCase()}`;
};

// Synchronous loader for active user session
const loadInitialUser = (): UserSession => {
  try {
    const savedUser = localStorage.getItem(ACTIVE_USER_KEY);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.username) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return { username: 'Jain', isDemo: true, setupCompleted: true };
};

// Synchronous loader for user-specific data
const loadUserData = (user: UserSession): StoredUserData => {
  const key = getUserDataStorageKey(user.username);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.accounts)) {
        return {
          transactions: parsed.transactions,
          accounts: parsed.accounts,
          people: parsed.people || [],
          invoices: parsed.invoices || [],
          auditLogs: parsed.auditLogs || [],
          experienceLevel: parsed.experienceLevel || 'casual',
          activeEntityId: parsed.activeEntityId || (parsed.entities?.[0]?.id || 'entity-demo'),
          entities: parsed.entities || SEED_ENTITIES,
        };
      }
    }
  } catch (e) {
    console.warn('Could not restore stored user state:', e);
  }

  // If no saved state exists yet for this user:
  if (user.isDemo || user.username.toLowerCase() === 'jain') {
    return {
      transactions: SEED_TRANSACTIONS,
      accounts: STARTER_ACCOUNTS,
      people: SEED_PEOPLE,
      invoices: SEED_INVOICES,
      auditLogs: INITIAL_AUDIT_LOGS,
      experienceLevel: 'casual',
      activeEntityId: 'entity-demo',
      entities: SEED_ENTITIES,
    };
  }

  // Fresh user default workspace
  const cleanEntity: Entity = {
    id: `entity-${user.username.toLowerCase()}-${Date.now()}`,
    name: `${user.username}'s Business`,
    type: 'business',
    icon: 'Building2',
    baseCurrency: 'USD',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '12-31',
  };

  return {
    transactions: [],
    accounts: STARTER_ACCOUNTS.map((a) => ({ ...a, balance: 0 })),
    people: [],
    invoices: [],
    auditLogs: [
      {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'WORKSPACE_INITIALIZED',
        actor: user.username,
        details: `Clean accounting workspace prepared for ${user.username}.`,
      },
    ],
    experienceLevel: 'casual',
    activeEntityId: cleanEntity.id,
    entities: [cleanEntity],
  };
};

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => loadInitialUser());

  // Load initial data for the current user synchronously on mount (prevents race condition overwrite)
  const initialData = useMemo(() => {
    return currentUser
      ? loadUserData(currentUser)
      : loadUserData({ username: 'Jain', isDemo: true, setupCompleted: true });
  }, []);

  // Initial states populated with stored user data
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialData.experienceLevel);
  const [profileContext, setProfileContext] = useState<ProfileContext>('personal');
  const [entities, setEntities] = useState<Entity[]>(initialData.entities);
  const [activeEntityId, setActiveEntityId] = useState<string>(initialData.activeEntityId);

  const [transactions, setTransactions] = useState<CanonicalTransaction[]>(initialData.transactions);
  const [accounts, setAccounts] = useState<Account[]>(initialData.accounts);
  const [people, setPeople] = useState<Person[]>(initialData.people);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(initialData.auditLogs);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<CanonicalTransaction | null>(null);

  // Sync to credential-scoped persistence whenever state changes
  useEffect(() => {
    if (!currentUser) return;
    const key = getUserDataStorageKey(currentUser.username);
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          transactions,
          accounts,
          people,
          invoices,
          auditLogs,
          experienceLevel,
          activeEntityId,
          entities,
        })
      );
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Quota exceeded or storage disabled:', e);
    }
  }, [
    currentUser,
    transactions,
    accounts,
    people,
    invoices,
    auditLogs,
    experienceLevel,
    activeEntityId,
    entities,
  ]);


  const activeEntity = useMemo(() => {
    return entities.find((e) => e.id === activeEntityId) || entities[0];
  }, [entities, activeEntityId]);

  // Tenant Isolation: filter transactions, people, invoices by entityId
  const entityTransactions = useMemo(() => {
    return transactions.filter((t) => t.entityId === activeEntityId);
  }, [transactions, activeEntityId]);

  const entityPeople = useMemo(() => {
    return people.filter((p) => p.entityId === activeEntityId);
  }, [people, activeEntityId]);

  const entityInvoices = useMemo(() => {
    return invoices.filter((i) => i.entityId === activeEntityId);
  }, [invoices, activeEntityId]);

  // Trial Balance & Accounting Health
  const trialBalance = useMemo(() => {
    return AccountingEngine.generateTrialBalance(accounts, entityTransactions);
  }, [accounts, entityTransactions]);

  const accountingHealth = useMemo(() => {
    return AccountingEngine.assessAccountingHealth(accounts, entityTransactions);
  }, [accounts, entityTransactions]);

  // Search filter
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return entityTransactions;
    const q = searchQuery.toLowerCase();
    return entityTransactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.originalInput.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.relevantBook.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        t.journalLines.some((l) => l.accountName.toLowerCase().includes(q))
    );
  }, [entityTransactions, searchQuery]);

  // Helper to add audit log
  const addAuditLog = (action: string, details: string, txId?: string) => {
    const newLog: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      actor: 'System / User',
      details,
      txId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Canonical posting via Deterministic Engine
  const postCanonicalTransaction = (txData: Partial<CanonicalTransaction>): AddTransactionResult => {
    // 1. Duplicate check
    const duplicate = AccountingEngine.detectDuplicate(txData, entityTransactions);

    // 2. Build canonical transaction
    const now = new Date();
    const dateStr = txData.date || now.toISOString().split('T')[0];
    const txId = txData.id || `TX-2026-${String(transactions.length + 1).padStart(3, '0')}`;
    const book = txData.relevantBook || AccountingEngine.determineBook(txData);

    const canonicalTx: CanonicalTransaction = {
      id: txId,
      entityId: activeEntityId,
      originalInput: txData.originalInput || txData.description || 'Transaction entry',
      description: txData.description || 'Financial transaction',
      date: dateStr,
      amount: txData.amount || 0,
      currency: txData.currency || activeEntity.baseCurrency,
      counterparty: txData.counterparty || 'General',
      counterpartyRole: txData.counterpartyRole || 'other',
      paymentMethod: txData.paymentMethod || 'Emirates NBD',
      transactionType: txData.transactionType || 'expense',
      isAsset: Boolean(txData.isAsset),
      status: 'posted',
      journalLines: txData.journalLines || [],
      relevantBook: book,
      explanation:
        txData.explanation ||
        `Transaction recorded in ${book} with debit and credit balance verified.`,
      relatedTransactionId: txData.relatedTransactionId,
      invoiceNumber: txData.invoiceNumber,
      timeline: [
        { timestamp: now.toISOString(), label: 'Created from natural language' },
        { timestamp: now.toISOString(), label: 'AI interpreted structured event' },
        { timestamp: now.toISOString(), label: `Accounting engine validated double-entry balance` },
        { timestamp: now.toISOString(), label: `Posted to ${book} and general ledgers` },
      ],
      comments: [],
      auditHistory: [],
    };

    // 3. Double-entry validation invariant: If it doesn't balance, do not post it!
    const validation = AccountingEngine.validateDoubleEntry(canonicalTx);
    if (!validation.isValid) {
      addAuditLog('TRANSACTION_REJECTED', `Attempted unbalanced transaction: ${validation.error}`);
      return {
        success: false,
        error: validation.error || 'Double-entry balance check failed.',
      };
    }

    // 4. Post to accounts
    const { updatedAccounts, auditLog } = AccountingEngine.applyTransactionToAccounts(
      canonicalTx,
      accounts
    );
    canonicalTx.auditHistory.push(auditLog);

    // 5. Update counterparties: Sarah owes you, John owed etc.
    setPeople((prev) => {
      const cpName = canonicalTx.counterparty;
      if (!cpName) return prev;
      return prev.map((p) => {
        if (p.name.toLowerCase() === cpName.toLowerCase() && p.entityId === activeEntityId) {
          let theyOwe = p.theyOweYou;
          let youOwe = p.youOweThem;

          // If receivable created (e.g. Sarah owes me 750)
          if (canonicalTx.transactionType === 'receivable') {
            theyOwe += canonicalTx.amount;
          }
          // If customer paid (reduces what they owe)
          else if (
            canonicalTx.transactionType === 'income' &&
            canonicalTx.journalLines.some((l) => l.accountName.toLowerCase().includes('receivable'))
          ) {
            theyOwe = Math.max(0, theyOwe - canonicalTx.amount);
          }
          // If paying someone you owe (e.g. Paid John 500)
          else if (
            canonicalTx.transactionType === 'payable' ||
            (canonicalTx.transactionType === 'expense' &&
              canonicalTx.journalLines.some((l) => l.accountName.toLowerCase().includes('payable')))
          ) {
            youOwe = Math.max(0, youOwe - canonicalTx.amount);
          }

          return { ...p, theyOweYou: theyOwe, youOweThem: youOwe };
        }
        return p;
      });
    });

    // 6. Save state
    setAccounts(updatedAccounts);
    setTransactions((prev) => [canonicalTx, ...prev]);
    setAuditLogs((prev) => [auditLog, ...prev]);

    return {
      success: true,
      transaction: canonicalTx,
      duplicateWarning: duplicate || undefined,
    };
  };

  // No destructive delete - voids transaction with reversal audit
  const voidTransaction = (txId: string, reason: string): boolean => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status === 'voided') return false;

    // Create reversing journal lines
    const reversalLines = tx.journalLines.map((l) => ({
      ...l,
      debit: l.credit,
      credit: l.debit,
    }));

    const reversalTx: CanonicalTransaction = {
      ...tx,
      id: `${tx.id}-VOID`,
      description: `[VOID REVERSAL] ${tx.description} — ${reason}`,
      journalLines: reversalLines,
      status: 'voided',
      timeline: [
        ...tx.timeline,
        {
          timestamp: new Date().toISOString(),
          label: `Voided with reason: ${reason}`,
        },
      ],
      auditHistory: [
        ...tx.auditHistory,
        {
          id: `AUD-VOID-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'TRANSACTION_VOIDED',
          actor: 'User',
          details: `Transaction ${tx.id} voided: ${reason}. Offsetting entries posted.`,
          txId,
        },
      ],
    };

    // Apply reversal to accounts
    const { updatedAccounts, auditLog } = AccountingEngine.applyTransactionToAccounts(
      reversalTx,
      accounts
    );

    setAccounts(updatedAccounts);
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'voided' } : t)).concat(reversalTx)
    );
    setAuditLogs((prev) => [auditLog, ...prev]);

    return true;
  };

  const addPersonComment = (txId: string, text: string) => {
    const comment = {
      id: `cmt-${Date.now()}`,
      author: 'Arham (Reviewer)',
      role: 'Reviewer',
      text,
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, comments: [...t.comments, comment] } : t))
    );
    addAuditLog('COMMENT_ADDED', `Added comment to transaction ${txId}: "${text}"`, txId);
  };

  const updatePersonBalance = (personName: string, deltaOweYou: number, deltaYouOwe: number) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.name.toLowerCase() === personName.toLowerCase() && p.entityId === activeEntityId) {
          return {
            ...p,
            theyOweYou: Math.max(0, p.theyOweYou + deltaOweYou),
            youOweThem: Math.max(0, p.youOweThem + deltaYouOwe),
          };
        }
        return p;
      })
    );
  };

  const createInvoice = (invData: Partial<Invoice>): Invoice => {
    const newInv: Invoice = {
      id: invData.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      entityId: activeEntityId,
      invoiceNumber: invData.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      counterparty: invData.counterparty || 'Client',
      description: invData.description || 'Services Rendered',
      amount: invData.amount || 0,
      paidAmount: 0,
      remainingAmount: invData.amount || 0,
      dueDate: invData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      status: 'unpaid',
      currency: activeEntity.baseCurrency,
    };
    setInvoices((prev) => [newInv, ...prev]);
    addAuditLog('INVOICE_CREATED', `Generated invoice ${newInv.invoiceNumber} for ${newInv.counterparty} (${newInv.currency} ${newInv.amount})`);
    return newInv;
  };

  const recordPaymentForInvoice = (invoiceId: string, amount: number, paymentMethod: string): boolean => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return false;

    const newPaid = inv.paidAmount + amount;
    const remaining = Math.max(0, inv.amount - newPaid);
    const newStatus = remaining === 0 ? 'paid' : 'partial';

    // Create posted transaction for this invoice payment
    postCanonicalTransaction({
      originalInput: `Payment of ${activeEntity.baseCurrency} ${amount} received for invoice ${inv.invoiceNumber}`,
      description: `Payment for ${inv.invoiceNumber} (${inv.counterparty})`,
      amount,
      currency: inv.currency,
      counterparty: inv.counterparty,
      counterpartyRole: 'customer',
      paymentMethod,
      transactionType: 'income',
      invoiceNumber: inv.invoiceNumber,
      journalLines: [
        { accountCode: '1020', accountName: paymentMethod, debit: amount, credit: 0 },
        { accountCode: '1030', accountName: 'Accounts Receivable', debit: 0, credit: amount },
      ],
      relevantBook: 'Cash Book',
      explanation: `Payment applied to invoice ${inv.invoiceNumber}. Remaining balance: ${activeEntity.baseCurrency} ${remaining}.`,
    });

    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, paidAmount: newPaid, remainingAmount: remaining, status: newStatus } : i))
    );

    return true;
  };

  // Guided Demo Steps
  const runDemoStep = async (stepNumber: number): Promise<string> => {
    if (stepNumber === 1) {
      // Demo Transaction #1: "Bought a MacBook from Amazon for AED 6,000 using Emirates NBD."
      const res = postCanonicalTransaction({
        originalInput: 'Bought a MacBook from Amazon for AED 6,000 using Emirates NBD.',
        description: 'MacBook purchased',
        amount: 6000,
        currency: 'AED',
        counterparty: 'Amazon',
        counterpartyRole: 'supplier',
        paymentMethod: 'Emirates NBD',
        transactionType: 'expense',
        isAsset: true,
        journalLines: [
          { accountCode: '1050', accountName: 'Equipment', debit: 6000, credit: 0 },
          { accountCode: '1020', accountName: 'Emirates NBD', debit: 0, credit: 6000 },
        ],
        relevantBook: 'Purchases Day Book',
        explanation: 'This purchase was classified as equipment because the item represents a business asset.',
      });
      if (res.transaction) setSelectedTransaction(res.transaction);
      return 'MacBook purchased\nAED 6,000\nAmazon\nPaid from Emirates NBD\n\nDone.';
    }

    if (stepNumber === 2) {
      // Demo Transaction #2: "Sarah owes me AED 750 for design work"
      postCanonicalTransaction({
        originalInput: 'Sarah owes me AED 750 for design work',
        description: 'Design work for Sarah',
        amount: 750,
        currency: 'AED',
        counterparty: 'Sarah',
        counterpartyRole: 'customer',
        paymentMethod: 'Accounts Receivable',
        transactionType: 'receivable',
        journalLines: [
          { accountCode: '1030', accountName: 'Accounts Receivable', debit: 750, credit: 0 },
          { accountCode: '4020', accountName: 'Services Income', debit: 0, credit: 750 },
        ],
        relevantBook: 'Sales Day Book',
        explanation: 'Recorded design services rendered on credit. Sarah now owes AED 750.',
      });
      return 'Sarah owes you AED 750\nRecorded in Sales Day Book and Accounts Receivable.';
    }

    if (stepNumber === 3) {
      // Demo Transaction #3: "I paid John AED 500 that I owed him."
      postCanonicalTransaction({
        originalInput: 'I paid John AED 500 that I owed him.',
        description: 'Payment to John (Debt settlement)',
        amount: 500,
        currency: 'AED',
        counterparty: 'John',
        counterpartyRole: 'supplier',
        paymentMethod: 'Emirates NBD',
        transactionType: 'payable',
        journalLines: [
          { accountCode: '2010', accountName: 'Accounts Payable', debit: 500, credit: 0 },
          { accountCode: '1020', accountName: 'Emirates NBD', debit: 0, credit: 500 },
        ],
        relevantBook: 'Cash Book',
        explanation: 'Payment made to John settles the recorded AED 500 liability. Outstanding balance is now AED 0.',
      });
      return 'Paid John AED 500\nLiability to John reduced to AED 0.';
    }

    if (stepNumber === 4) {
      // Demo Transaction #4: "Amazon refunded AED 400."
      postCanonicalTransaction({
        originalInput: 'Amazon refunded AED 400.',
        description: 'Amazon refund for MacBook adjustment',
        amount: 400,
        currency: 'AED',
        counterparty: 'Amazon',
        counterpartyRole: 'supplier',
        paymentMethod: 'Emirates NBD',
        transactionType: 'refund',
        relatedTransactionId: 'TX-2026-004',
        journalLines: [
          { accountCode: '1020', accountName: 'Emirates NBD', debit: 400, credit: 0 },
          { accountCode: '1050', accountName: 'Equipment', debit: 0, credit: 400 },
        ],
        relevantBook: 'Purchases Returns',
        explanation: 'Refund credited back to Emirates NBD, reducing equipment cost basis.',
      });
      return 'Amazon refunded AED 400\nLinked to original purchase. Emirates NBD credited AED 400.';
    }

    return 'Demo step completed.';
  };

  const login = (username: string, password?: string) => {
    const trimmedUser = username.trim();
    const isJainDemo =
      trimmedUser.toLowerCase() === 'jain' &&
      (!password || password === 'MyAccount1234');

    // Check if this user had a previous session or registered profile
    let setupCompleted = isJainDemo;
    try {
      const vaultRaw = localStorage.getItem(USERS_VAULT_KEY);
      if (vaultRaw) {
        const vault = JSON.parse(vaultRaw);
        if (vault[trimmedUser.toLowerCase()]) {
          setupCompleted = Boolean(vault[trimmedUser.toLowerCase()].setupCompleted);
        }
      }
    } catch (e) {
      // ignore
    }

    const sessionUser: UserSession = {
      username: trimmedUser || 'New User',
      isDemo: isJainDemo,
      setupCompleted,
    };

    // Load existing stored data for this specific credential if it exists
    const userData = loadUserData(sessionUser);

    setCurrentUser(sessionUser);
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(sessionUser));

    // Save in user vault dictionary
    try {
      const vaultRaw = localStorage.getItem(USERS_VAULT_KEY);
      const vault = vaultRaw ? JSON.parse(vaultRaw) : {};
      vault[trimmedUser.toLowerCase()] = {
        username: trimmedUser,
        isDemo: isJainDemo,
        setupCompleted,
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(vault));
    } catch (e) {
      // ignore
    }

    setTransactions(userData.transactions);
    setAccounts(userData.accounts);
    setPeople(userData.people);
    setInvoices(userData.invoices);
    setEntities(userData.entities);
    setActiveEntityId(userData.activeEntityId);
    setAuditLogs(userData.auditLogs);
    setExperienceLevel(userData.experienceLevel);

    addAuditLog(
      'USER_LOGIN',
      `User ${sessionUser.username} authenticated with persisted workspace.`,
      undefined
    );

    return { success: true, isDemo: isJainDemo };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(ACTIVE_USER_KEY);
  };

  const addEntity = (newEntity: Entity) => {
    setEntities((prev) => [...prev, newEntity]);
    setActiveEntityId(newEntity.id);
    addAuditLog('ENTITY_CREATED', `Created new organization entity: ${newEntity.name}`);
  };

  const updateActiveEntity = (updates: Partial<Entity>) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === activeEntityId ? { ...e, ...updates } : e))
    );
    addAuditLog('ENTITY_UPDATED', `Updated organization profile for ${activeEntity.name}`);
  };

  const completeOrganizationSetup = (config: {
    entityName: string;
    entityType: 'personal' | 'business' | 'client';
    baseCurrency: string;
    fiscalYearStart: string;
    taxNumber?: string;
    initialBankBalance?: number;
    initialBankName?: string;
  }) => {
    const updatedEntity: Entity = {
      ...activeEntity,
      name: config.entityName || activeEntity.name,
      type: config.entityType || activeEntity.type,
      baseCurrency: config.baseCurrency || activeEntity.baseCurrency,
      fiscalYearStart: config.fiscalYearStart || activeEntity.fiscalYearStart,
    };
    setEntities((prev) => prev.map((e) => (e.id === activeEntity.id ? updatedEntity : e)));

    if (config.initialBankBalance && config.initialBankBalance > 0) {
      const bankName = config.initialBankName || 'Primary Operating Bank';
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.code === '1020') {
            return { ...acc, name: bankName, balance: config.initialBankBalance! };
          }
          if (acc.code === '3010') {
            return { ...acc, balance: config.initialBankBalance! };
          }
          return acc;
        })
      );

      postCanonicalTransaction({
        originalInput: `Opening capital deposit of ${config.baseCurrency} ${config.initialBankBalance.toLocaleString()} to ${bankName}.`,
        description: `Initial Opening Balance - Capital Deposit into ${bankName}`,
        amount: config.initialBankBalance,
        currency: config.baseCurrency,
        counterparty: 'Founder / Equity Holder',
        counterpartyRole: 'supplier',
        paymentMethod: bankName,
        transactionType: 'income',
        journalLines: [
          { accountCode: '1020', accountName: bankName, debit: config.initialBankBalance, credit: 0 },
          { accountCode: '3010', accountName: 'Owner Capital', debit: 0, credit: config.initialBankBalance },
        ],
        relevantBook: 'Cash Book',
        explanation: `Initial capital contribution recorded as opening balance for ${config.entityName}.`,
      });
    }

    if (currentUser) {
      const updatedUser: UserSession = { ...currentUser, setupCompleted: true };
      setCurrentUser(updatedUser);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));

      try {
        const vaultRaw = localStorage.getItem(USERS_VAULT_KEY);
        const vault = vaultRaw ? JSON.parse(vaultRaw) : {};
        if (vault[currentUser.username.toLowerCase()]) {
          vault[currentUser.username.toLowerCase()].setupCompleted = true;
          localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(vault));
        }
      } catch (e) {
        // ignore
      }
    }

    addAuditLog(
      'ORGANIZATION_SETUP_COMPLETED',
      `Completed organization setup for ${config.entityName} (Currency: ${config.baseCurrency}, Fiscal Year: ${config.fiscalYearStart}).`
    );
  };

  const resetToDemoState = () => {
    if (!currentUser) return;
    const key = getUserDataStorageKey(currentUser.username);
    localStorage.removeItem(key);

    const resetData =
      currentUser.isDemo || currentUser.username.toLowerCase() === 'jain'
        ? {
            transactions: SEED_TRANSACTIONS,
            accounts: STARTER_ACCOUNTS,
            people: SEED_PEOPLE,
            invoices: SEED_INVOICES,
            entities: SEED_ENTITIES,
            auditLogs: INITIAL_AUDIT_LOGS,
            experienceLevel: 'casual' as ExperienceLevel,
            activeEntityId: 'entity-demo',
          }
        : {
            transactions: [],
            accounts: STARTER_ACCOUNTS.map((a) => ({ ...a, balance: 0 })),
            people: [],
            invoices: [],
            entities: [
              {
                id: `entity-${currentUser.username.toLowerCase()}`,
                name: `${currentUser.username}'s Business`,
                type: 'business' as const,
                icon: 'Building2',
                baseCurrency: 'USD',
                fiscalYearStart: '01-01',
                fiscalYearEnd: '12-31',
              },
            ],
            auditLogs: [
              {
                id: `AUD-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'WORKSPACE_RESET',
                actor: currentUser.username,
                details: `Workspace reset to clean state for ${currentUser.username}.`,
              },
            ],
            experienceLevel: 'casual' as ExperienceLevel,
            activeEntityId: `entity-${currentUser.username.toLowerCase()}`,
          };

    setTransactions(resetData.transactions);
    setAccounts(resetData.accounts);
    setPeople(resetData.people);
    setInvoices(resetData.invoices);
    setEntities(resetData.entities);
    setAuditLogs(resetData.auditLogs);
    setExperienceLevel(resetData.experienceLevel);
    setActiveEntityId(resetData.activeEntityId);
    setSelectedTransaction(null);
    setSearchQuery('');
  };

  return (
    <AccountingContext.Provider
      value={{
        currentUser,
        login,
        logout,
        completeOrganizationSetup,
        experienceLevel,
        setExperienceLevel,
        profileContext,
        setProfileContext,
        entities,
        activeEntity,
        setActiveEntityId,
        addEntity,
        updateActiveEntity,
        transactions: entityTransactions,
        allTransactions: transactions,
        accounts,
        people: entityPeople,
        invoices: entityInvoices,
        auditLogs,
        accountingHealth,
        trialBalance,
        postCanonicalTransaction,
        voidTransaction,
        addPersonComment,
        updatePersonBalance,
        createInvoice,
        recordPaymentForInvoice,
        addAuditLog,
        searchQuery,
        setSearchQuery,
        filteredTransactions,
        selectedTransaction,
        setSelectedTransaction,
        runDemoStep,
        resetToDemoState,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
