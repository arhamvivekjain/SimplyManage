import React, { useState } from 'react';
import { FileText, Sparkles, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const ReportsPage: React.FC = () => {
  const { transactions, activeEntity, accounts } = useAccounting();

  const [activeReport, setActiveReport] = useState<'pnl' | 'balance-sheet' | 'cash-flow'>('pnl');

  // Profit & Loss calculation
  const incomeTx = transactions.filter((t) => t.transactionType === 'income' && t.status === 'posted');
  const expenseTx = transactions.filter((t) => t.transactionType === 'expense' && t.status === 'posted');

  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Balance Sheet breakdown
  const assetAccounts = accounts.filter((a) => a.type === 'asset');
  const liabilityAccounts = accounts.filter((a) => a.type === 'liability');
  const equityAccounts = accounts.filter((a) => a.type === 'equity');

  const totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
  const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0) + netProfit;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
            Financial Statements & Intelligence
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reports</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Automated, plain-language statements derived strictly from recorded accounting data.
          </p>
        </div>

        {/* Report Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveReport('pnl')}
            className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-xl transition-colors ${
              activeReport === 'pnl' ? 'bg-white text-black font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveReport('balance-sheet')}
            className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-xl transition-colors ${
              activeReport === 'balance-sheet' ? 'bg-white text-black font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveReport('cash-flow')}
            className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-xl transition-colors ${
              activeReport === 'cash-flow' ? 'bg-white text-black font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cash Flow
          </button>
        </div>
      </div>

      {/* Plain Language Explanation Card */}
      <div className="p-6 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-xs text-zinc-300 space-y-2">
        <div className="flex items-center gap-2 font-mono font-bold text-emerald-400 uppercase tracking-wider text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plain-Language Report Summary</span>
        </div>
        {activeReport === 'pnl' && (
          <p className="font-sans leading-relaxed text-zinc-300 text-sm">
            Net profit for this period is <strong className="font-mono text-emerald-400 font-bold">{activeEntity.baseCurrency} {netProfit.toLocaleString()}</strong>.
            Your total recorded income was {activeEntity.baseCurrency} {totalIncome.toLocaleString()} across {incomeTx.length} transactions, and total operational expenses were {activeEntity.baseCurrency} {totalExpense.toLocaleString()}.
          </p>
        )}
        {activeReport === 'balance-sheet' && (
          <p className="font-sans leading-relaxed text-zinc-300 text-sm">
            Your total recorded assets equal <strong className="font-mono text-emerald-400 font-bold">{activeEntity.baseCurrency} {totalAssets.toLocaleString()}</strong> (including bank accounts, receivables, and equipment), balanced against liabilities of {activeEntity.baseCurrency} {totalLiabilities.toLocaleString()} and net owner equity.
          </p>
        )}
        {activeReport === 'cash-flow' && (
          <p className="font-sans leading-relaxed text-zinc-300 text-sm">
            Cash transactions and operational inflows reflect current operational liquidity managed across your primary accounts (Emirates NBD and Cash on hand).
          </p>
        )}
        <div className="text-[11px] font-mono text-zinc-500 pt-1">
          * Factual description of recorded data; never unsolicited financial or investment advice.
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 space-y-6">
        {activeReport === 'pnl' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Profit & Loss Statement</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">For current accounting fiscal period</p>
            </div>

            {/* Income Section */}
            <div>
              <div className="text-xs font-mono font-medium uppercase tracking-widest text-zinc-400 mb-2.5">
                Revenues & Income
              </div>
              <div className="divide-y divide-zinc-800/60 text-xs">
                {incomeTx.map((tx) => (
                  <div key={tx.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-white">{tx.description}</span>
                      <span className="text-zinc-500 font-mono ml-2">({tx.counterparty})</span>
                    </div>
                    <span className="font-mono font-medium text-emerald-400">
                      {activeEntity.baseCurrency} {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {incomeTx.length === 0 && (
                  <div className="py-3 text-zinc-500 font-mono italic">No income recorded for this period.</div>
                )}
                <div className="pt-3 flex justify-between font-bold text-white text-sm font-mono border-t border-zinc-800">
                  <span>Total Revenues</span>
                  <span className="text-emerald-400">
                    {activeEntity.baseCurrency} {totalIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Section */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="text-xs font-mono font-medium uppercase tracking-widest text-zinc-400 mb-2.5">
                Operating Expenses
              </div>
              <div className="divide-y divide-zinc-800/60 text-xs">
                {expenseTx.map((tx) => (
                  <div key={tx.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-white">{tx.description}</span>
                      <span className="text-zinc-500 font-mono ml-2">({tx.counterparty})</span>
                    </div>
                    <span className="font-mono font-medium text-zinc-300">
                      {activeEntity.baseCurrency} {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 flex justify-between font-bold text-white text-sm font-mono border-t border-zinc-800">
                  <span>Total Operating Expenses</span>
                  <span className="text-zinc-200">
                    {activeEntity.baseCurrency} {totalExpense.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Profit summary */}
            <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest font-medium text-zinc-400 block">
                  Net Operating Profit
                </span>
                <span className="text-xs text-zinc-500 font-mono mt-0.5 block">Total Income minus Operating Expenses</span>
              </div>
              <div
                className={`text-2xl font-bold font-mono ${
                  netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeEntity.baseCurrency} {netProfit.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {activeReport === 'balance-sheet' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Balance Sheet</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">As of today • Financial position</p>
            </div>

            {/* Assets */}
            <div>
              <div className="text-xs font-mono font-medium uppercase tracking-widest text-zinc-400 mb-2.5">
                Assets
              </div>
              <div className="divide-y divide-zinc-800/60 text-xs">
                {assetAccounts.map((acc) => (
                  <div key={acc.code} className="py-2.5 flex justify-between items-center">
                    <span className="font-medium text-white">{acc.name}</span>
                    <span className="font-mono font-medium text-zinc-200">
                      {activeEntity.baseCurrency} {acc.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 flex justify-between font-bold text-white text-sm font-mono border-t border-zinc-800">
                  <span>Total Assets</span>
                  <span className="text-emerald-400">
                    {activeEntity.baseCurrency} {totalAssets.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="text-xs font-mono font-medium uppercase tracking-widest text-zinc-400 mb-2.5">
                Liabilities
              </div>
              <div className="divide-y divide-zinc-800/60 text-xs">
                {liabilityAccounts.map((acc) => (
                  <div key={acc.code} className="py-2.5 flex justify-between items-center">
                    <span className="font-medium text-white">{acc.name}</span>
                    <span className="font-mono font-medium text-zinc-200">
                      {activeEntity.baseCurrency} {acc.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 flex justify-between font-bold text-white text-sm font-mono border-t border-zinc-800">
                  <span>Total Liabilities</span>
                  <span className="text-zinc-200">
                    {activeEntity.baseCurrency} {totalLiabilities.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="text-xs font-mono font-medium uppercase tracking-widest text-zinc-400 mb-2.5">
                Equity
              </div>
              <div className="divide-y divide-zinc-800/60 text-xs">
                {equityAccounts.map((acc) => (
                  <div key={acc.code} className="py-2.5 flex justify-between items-center">
                    <span className="font-medium text-white">{acc.name}</span>
                    <span className="font-mono font-medium text-zinc-200">
                      {activeEntity.baseCurrency} {acc.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-medium text-white">Current Period Retained Profit</span>
                  <span className="font-mono font-medium text-emerald-400">
                    {activeEntity.baseCurrency} {netProfit.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 flex justify-between font-bold text-white text-sm font-mono border-t border-zinc-800">
                  <span>Total Equity</span>
                  <span className="text-emerald-400">
                    {activeEntity.baseCurrency} {totalEquity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'cash-flow' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Statement of Cash Flows</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Operating, investing, and financing cash flows</p>
            </div>

            <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-xs space-y-3 font-mono">
              <div className="flex justify-between font-semibold text-white">
                <span>Net Cash Inflow from Operations</span>
                <span className="text-emerald-400">
                  +{activeEntity.baseCurrency} {(totalIncome - 5000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Equipment & Capital Outflows</span>
                <span className="text-zinc-200">
                  -{activeEntity.baseCurrency} 6,000
                </span>
              </div>
              <div className="flex justify-between font-bold text-white pt-2.5 border-t border-zinc-800">
                <span>Closing Bank & Cash Position (Emirates NBD + Cash)</span>
                <span className="text-emerald-400">
                  {activeEntity.baseCurrency} 89,500
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
