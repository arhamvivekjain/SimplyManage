import React, { useState } from 'react';
import { BookOpen, Calendar, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { BookType, CanonicalTransaction } from '../types';

interface BooksPageProps {
  onInspectTransaction: (tx: CanonicalTransaction) => void;
}

export const BooksPage: React.FC<BooksPageProps> = ({ onInspectTransaction }) => {
  const { transactions, activeEntity } = useAccounting();

  const [selectedBook, setSelectedBook] = useState<BookType>('Purchases Day Book');

  const allBooks: BookType[] = [
    'Purchases Day Book',
    'Sales Day Book',
    'Cash Book',
    'Petty Cash Book',
    'Purchases Returns',
    'Sales Returns',
    'Bills Receivable',
    'Bills Payable',
    'General Journal',
  ];

  const bookTransactions = transactions.filter((t) => t.relevantBook === selectedBook);
  const bookTotal = bookTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Professional Registry
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Books of Prime Entry
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Standard accounting books derived automatically from canonical events. No duplicate entry required.
        </p>
      </div>

      {/* Book Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth">
        {allBooks.map((book) => {
          const count = transactions.filter((t) => t.relevantBook === book).length;
          const isSelected = selectedBook === book;
          return (
            <button
              key={book}
              onClick={() => setSelectedBook(book)}
              className={`px-3.5 py-2 text-xs font-mono font-medium rounded-2xl whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              <span>{book}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-black text-white' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Book View */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden">
        {/* Book Header Summary */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
              Active Register
            </div>
            <h3 className="text-lg font-bold text-white">{selectedBook}</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Entries posted to this register: {bookTransactions.length}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs text-zinc-500 uppercase font-mono font-medium">Book Total</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {activeEntity.baseCurrency} {bookTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Mobile View for Entries (md:hidden) */}
        <div className="block md:hidden divide-y divide-zinc-800/60 font-mono p-3 space-y-3">
          {bookTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onInspectTransaction(tx)}
              className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-2 cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{tx.id}</span>
                <span className="text-zinc-400">{tx.date}</span>
              </div>
              <div className="font-sans font-medium text-white text-sm">
                {tx.description}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60">
                <span className="text-zinc-400 font-sans">{tx.counterparty || '—'}</span>
                <span className="font-bold text-white">
                  {activeEntity.baseCurrency} {tx.amount.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                Folio: {tx.journalLines.map((l) => l.accountName).join(', ')}
              </div>
            </div>
          ))}
          {bookTransactions.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              Nothing recorded in {selectedBook} yet.
            </div>
          )}
        </div>

        {/* Desktop Entries Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Ref / Tx ID</th>
                <th className="py-3.5 px-4">Particulars / Description</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Counterparty</th>
                <th className="py-3.5 px-4">Folio / Ledgers</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Amount ({activeEntity.baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {bookTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onInspectTransaction(tx)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 text-zinc-400 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 whitespace-nowrap">{tx.id}</td>
                  <td className="py-3.5 px-4 font-sans font-medium text-white">{tx.description}</td>
                  <td className="py-3.5 px-4 font-sans text-zinc-300 whitespace-nowrap">{tx.counterparty || '—'}</td>
                  <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                    {tx.journalLines.map((l) => l.accountName).join(', ')}
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-white whitespace-nowrap">
                    {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {bookTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                    Nothing recorded in {selectedBook} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
