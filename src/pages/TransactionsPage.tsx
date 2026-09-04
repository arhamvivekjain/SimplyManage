import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  ChevronDown,
  Layers,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CanonicalTransaction, BookType } from '../types';

interface TransactionsPageProps {
  onInspectTransaction: (tx: CanonicalTransaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onInspectTransaction,
}) => {
  const { transactions, activeEntity, searchQuery, setSearchQuery } = useAccounting();

  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const books: BookType[] = [
    'Sales Day Book',
    'Purchases Day Book',
    'Sales Returns',
    'Purchases Returns',
    'Cash Book',
    'Petty Cash Book',
    'General Journal',
  ];

  const filtered = transactions.filter((t) => {
    if (selectedBookFilter !== 'all' && t.relevantBook !== selectedBookFilter) return false;
    if (selectedTypeFilter !== 'all' && t.transactionType !== selectedTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.originalInput.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Amount', 'Currency', 'Counterparty', 'Payment Method', 'Book', 'Status'];
    const rows = filtered.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      `"${t.counterparty}"`,
      `"${t.paymentMethod}"`,
      `"${t.relevantBook}"`,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SimplyManage_Transactions_${activeEntity.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `SimplyManage_Canonical_${activeEntity.name}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-block">
            Canonical Audit Stream
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Transactions</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-0.5">
            Single source of truth. Every transaction automatically feeds journals, books, and ledgers.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-mono font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-mono font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Export Canonical JSON"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar with View Mode Toggle */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, counterparty, ID..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
          {/* Book Filter */}
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-emerald-500/80 transition-colors min-w-[150px]"
          >
            <option value="all">All Books of Entry</option>
            {books.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-emerald-500/80 transition-colors min-w-[120px]"
          >
            <option value="all">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="receivable">Receivable</option>
            <option value="payable">Payable</option>
            <option value="refund">Refund</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* View Mode Switcher: Table vs Cards */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Full Ledger Table View"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Mobile Card Stream View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Transactions View: Full Ledger Table (with horizontal scroll bar) OR Card Stream */}
      {viewMode === 'table' ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
          {/* Table Header Bar with Scroll Indicator */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                Ledger Entries ({filtered.length})
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono">
                ← Scroll Horizontally →
              </span>
            </div>
          </div>

          {/* Scrollable Table Container */}
          <div className="overflow-x-auto visible-table-scrollbar w-full">
            <table className="w-full min-w-[940px] text-left text-xs table-auto divide-y divide-zinc-800/60">
              <thead className="bg-zinc-950/90 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px] sticky top-0 z-20">
                <tr>
                  <th className="py-3.5 px-4 w-28 whitespace-nowrap sticky left-0 bg-zinc-950 z-30 shadow-[2px_0_4px_rgba(0,0,0,0.5)]">
                    Tx ID
                  </th>
                  <th className="py-3.5 px-3 w-28 whitespace-nowrap">Date</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Description</th>
                  <th className="py-3.5 px-3 w-36 whitespace-nowrap">Counterparty</th>
                  <th className="py-3.5 px-3 w-36 whitespace-nowrap">Account / Method</th>
                  <th className="py-3.5 px-3 w-40 whitespace-nowrap">Book of Entry</th>
                  <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Amount</th>
                  <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onInspectTransaction(tx)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap sticky left-0 bg-zinc-900/95 group-hover:bg-zinc-850 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.5)]">
                      {tx.id}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-zinc-400 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors">
                        {tx.description}
                      </div>
                      {tx.originalInput && (
                        <div className="text-[11px] text-zinc-400 font-mono truncate max-w-sm sm:max-w-md mt-0.5">
                          &ldquo;{tx.originalInput}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-300 font-medium whitespace-nowrap">
                      {tx.counterparty || '—'}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-400 font-mono whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                        {tx.relevantBook}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                      <span
                        className={
                          tx.transactionType === 'income' || tx.transactionType === 'receivable'
                            ? 'text-emerald-400'
                            : tx.transactionType === 'refund'
                            ? 'text-blue-400'
                            : 'text-white'
                        }
                      >
                        {tx.currency} {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block whitespace-nowrap text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          tx.status === 'posted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.status === 'voided'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                      No transactions matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mobile Card Stream */
        <div className="space-y-3">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onInspectTransaction(tx)}
              className="p-4 bg-zinc-900/60 border border-zinc-800/90 rounded-2xl space-y-3 cursor-pointer hover:border-zinc-700 transition-all active:scale-[0.99] shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">{tx.id}</span>
                  <span className="text-zinc-500 text-xs font-mono">•</span>
                  <span className="text-zinc-400 text-xs font-mono">{tx.date}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    tx.status === 'posted'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : tx.status === 'voided'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div>
                <div className="font-semibold text-sm text-white">{tx.description}</div>
                {tx.originalInput && (
                  <div className="text-xs text-zinc-400 font-mono mt-1 line-clamp-1">
                    &ldquo;{tx.originalInput}&rdquo;
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60 text-xs">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Book of Entry</div>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                    {tx.relevantBook}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Amount</div>
                  <div
                    className={`text-base font-mono font-bold mt-0.5 ${
                      tx.transactionType === 'income' || tx.transactionType === 'receivable'
                        ? 'text-emerald-400'
                        : tx.transactionType === 'refund'
                        ? 'text-blue-400'
                        : 'text-white'
                    }`}
                  >
                    {tx.currency} {tx.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                <span>{tx.counterparty || 'Internal'}</span>
                <span>via {tx.paymentMethod}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs bg-zinc-900/20 border border-zinc-800/80 rounded-2xl">
              No transactions matching the selected criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
