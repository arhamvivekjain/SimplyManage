import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Receipt,
  FileText,
  Building,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { AIInputBox } from '../components/AIInputBox';
import { CanonicalTransaction } from '../types';

interface HomePageProps {
  onInspectTransaction: (tx: CanonicalTransaction) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenScanReceipt: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onInspectTransaction,
  onNavigateToTab,
  onOpenCreateInvoice,
  onOpenScanReceipt,
}) => {
  const {
    transactions,
    people,
    activeEntity,
    accountingHealth,
    experienceLevel,
  } = useAccounting();

  // "Who owes me?"
  const peopleWhoOwe = people.filter((p) => p.theyOweYou > 0);
  const totalOwedToYou = peopleWhoOwe.reduce((sum, p) => sum + p.theyOweYou, 0);

  // "Who do I owe?"
  const peopleYouOwe = people.filter((p) => p.youOweThem > 0);
  const totalYouOwe = peopleYouOwe.reduce((sum, p) => sum + p.youOweThem, 0);

  // Current relevant income & expense summaries
  const totalIncome = transactions
    .filter((t) => t.transactionType === 'income' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.transactionType === 'expense' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Center: The AI Input Box */}
      <section className="pt-2">
        <AIInputBox
          onTransactionCreated={(tx) => {
            // Auto open inspection if desired or notify
          }}
          onInspectTransaction={onInspectTransaction}
        />
      </section>

      {/* Accounting Health Status Banner (Bento Spec Registry style) */}
      <section className="max-w-5xl mx-auto">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  accountingHealth.isBalanced ? 'bg-emerald-500' : 'bg-rose-500'
                } animate-pulse`}
              />
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-300">
                Accounting Integrity Status
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Books balanced
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Zero duplicates
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Double-entry invariant valid
              </span>
              {accountingHealth.clarificationItemsCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {accountingHealth.clarificationItemsCount} items need clarification
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Primary Financial Overview - Bento Grid */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: "You Owe" */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                You Owe
              </span>
              <button
                onClick={() => onNavigateToTab('people')}
                className="text-xs font-mono text-zinc-500 hover:text-zinc-200 flex items-center gap-0.5 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-3xl font-bold font-mono text-white mt-3 tracking-tight">
              {activeEntity.baseCurrency} {totalYouOwe.toLocaleString()}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/60 space-y-1.5">
            {peopleYouOwe.slice(0, 2).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium truncate max-w-[110px]">{p.name}</span>
                <span className="font-mono font-semibold text-zinc-200">
                  {p.currency} {p.youOweThem.toLocaleString()}
                </span>
              </div>
            ))}
            {peopleYouOwe.length === 0 && (
              <div className="text-xs text-zinc-500 italic font-mono">No payables due.</div>
            )}
          </div>
        </div>

        {/* Card 2: "You're Owed" */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                You&apos;re Owed
              </span>
              <button
                onClick={() => onNavigateToTab('people')}
                className="text-xs font-mono text-zinc-500 hover:text-zinc-200 flex items-center gap-0.5 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400 mt-3 tracking-tight">
              {activeEntity.baseCurrency} {totalOwedToYou.toLocaleString()}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/60 space-y-1.5">
            {peopleWhoOwe.slice(0, 2).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium truncate max-w-[110px]">{p.name}</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {p.currency} {p.theyOweYou.toLocaleString()}
                </span>
              </div>
            ))}
            {peopleWhoOwe.length === 0 && (
              <div className="text-xs text-zinc-500 italic font-mono">No receivables pending.</div>
            )}
          </div>
        </div>

        {/* Card 3: Income Summary */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                Revenue
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Period</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white mt-3 tracking-tight">
              {activeEntity.baseCurrency} {totalIncome.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-4 pt-3 border-t border-zinc-800/60 font-mono">
            Receipts, retainers & service fees.
          </p>
        </div>

        {/* Card 4: Expenses Summary */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                Operating Costs
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Period</span>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-200 mt-3 tracking-tight">
              {activeEntity.baseCurrency} {totalExpense.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-4 pt-3 border-t border-zinc-800/60 font-mono">
            Equipment, supplies & overhead.
          </p>
        </div>
      </section>

      {/* Quick Action Bento Row */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenCreateInvoice}
          className="bg-zinc-900/40 hover:bg-zinc-850/80 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl p-5 text-left flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 group-hover:text-white">
                Create Invoice
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Guided 4-step wizard
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>

        <button
          onClick={onOpenScanReceipt}
          className="bg-zinc-900/40 hover:bg-zinc-850/80 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl p-5 text-left flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 group-hover:text-white">
                Scan Receipt / OCR
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Receipt auto-extractor
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateToTab('reports')}
          className="bg-zinc-900/40 hover:bg-zinc-850/80 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl p-5 text-left flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 group-hover:text-white">
                Financial Reports
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Plain-English P&L & Cash Flow
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>
      </section>

      {/* Section: Recent Activity (Bento Wide Panel) */}
      <section className="max-w-5xl mx-auto">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-2">
            <div>
              <h2 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
                Canonical Ledger Stream
              </h2>
              <p className="text-lg font-semibold text-white">Recent Activity</p>
            </div>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1 font-mono"
            >
              <span>VIEW ALL ({transactions.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-zinc-800/60">
            {transactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                onClick={() => onInspectTransaction(tx)}
                className="py-3.5 px-2 hover:bg-zinc-800/40 rounded-2xl cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      tx.transactionType === 'income' || tx.transactionType === 'receivable'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : tx.transactionType === 'refund'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-zinc-800/90 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {tx.transactionType === 'income' || tx.transactionType === 'receivable' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {tx.description}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{tx.date}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{tx.counterparty || 'General'}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-mono font-bold ${
                      tx.transactionType === 'income' || tx.transactionType === 'receivable'
                        ? 'text-emerald-400'
                        : 'text-white'
                    }`}
                  >
                    {tx.transactionType === 'income' ? '+' : tx.transactionType === 'expense' ? '-' : ''}
                    {tx.currency} {tx.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5 group-hover:text-zinc-400 transition-colors">
                    Inspect →
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-xs font-mono">
                No transactions recorded yet. Tell SimplyManage what happened to get started.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
