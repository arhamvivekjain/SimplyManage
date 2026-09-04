import { Account } from '../types';

export const STARTER_ACCOUNTS: Account[] = [
  // Assets
  { code: '1010', name: 'Cash', type: 'asset', description: 'Cash on hand', balance: 5000 },
  { code: '1020', name: 'Emirates NBD', type: 'asset', description: 'Primary business operational bank account', balance: 84500 },
  { code: '1030', name: 'Accounts Receivable', type: 'asset', description: 'Amounts owed by clients and customers', balance: 6450 },
  { code: '1040', name: 'Inventory', type: 'asset', description: 'Physical items held for sale', balance: 12000 },
  { code: '1050', name: 'Equipment', type: 'asset', description: 'Fixed assets, electronics, and machines', balance: 18000 },

  // Liabilities
  { code: '2010', name: 'Accounts Payable', type: 'liability', description: 'Amounts owed to vendors and suppliers', balance: 3700 },
  { code: '2020', name: 'Bank Loans', type: 'liability', description: 'Outstanding business financing', balance: 0 },
  { code: '2030', name: 'Tax Payable', type: 'liability', description: 'Accrued VAT and corporate tax', balance: 1250 },

  // Equity
  { code: '3010', name: 'Owner Capital', type: 'equity', description: 'Capital invested into the entity', balance: 95000 },
  { code: '3020', name: 'Retained Earnings', type: 'equity', description: 'Accumulated net profit', balance: 26000 },

  // Income
  { code: '4010', name: 'Sales Income', type: 'income', description: 'Revenue from direct product sales', balance: 18500 },
  { code: '4020', name: 'Services Income', type: 'income', description: 'Professional design and advisory fees', balance: 14200 },

  // Expenses
  { code: '5010', name: 'Rent Expense', type: 'expense', description: 'Premises and office rent', balance: 5000 },
  { code: '5020', name: 'Utilities Expense', type: 'expense', description: 'Electricity, water, and internet', balance: 950 },
  { code: '5030', name: 'Software Expense', type: 'expense', description: 'SaaS tools, cloud infrastructure, licenses', balance: 850 },
  { code: '5040', name: 'Salaries Expense', type: 'expense', description: 'Staff payroll and benefits', balance: 12000 },
  { code: '5050', name: 'Advertising Expense', type: 'expense', description: 'Marketing, ads, and promotions', balance: 1400 },
  { code: '5060', name: 'Office Supplies Expense', type: 'expense', description: 'Consumables, stationery, sundries', balance: 550 },
];
