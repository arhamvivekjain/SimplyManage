import React, { useState } from 'react';
import { Layers, Folder, Search, ArrowRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CanonicalTransaction } from '../types';

interface LedgersPageProps {
  onInspectTransaction: (tx: CanonicalTransaction) => void;
}

export const LedgersPage: React.FC<LedgersPageProps> = ({ onInspectTransaction }) => {
  const { accounts, transactions, activeEntity } = useAccounting();

  const [selectedAccountName, setSelectedAccountName] = useState<string>('Equipment');

  // Collect all ledger postings for selected account
  const postings: Array<{
    date: string;
    txId: string;
    description: string;
    debit: number;
    credit: number;
    tx: CanonicalTransaction;
  }> = [];

  for (const tx of transactions.filter((t) => t.status === 'posted')) {
    for (const line of tx.journalLines) {
      if (line.accountName.toLowerCase() === selectedAccountName.toLowerCase()) {
        postings.push({
          date: tx.date,
          txId: tx.id,
          description: tx.description,
          debit: line.debit,
          credit: line.credit,
          tx,
        });
      }
    }
  }

  const selectedAcc = accounts.find(
    (a) => a.name.toLowerCase() === selectedAccountName.toLowerCase()
  );

  const totalDebits = postings.reduce((sum, p) => sum + p.debit, 0);
  const totalCredits = postings.reduce((sum, p) => sum + p.credit, 0);

  // Running balance: if Asset/Expense, balance = Debits - Credits. Else Credits - Debits.
  const isNormalDebit =
    !selectedAcc || selectedAcc.type === 'asset' || selectedAcc.type === 'expense';
  const currentNetBalance = isNormalDebit ? totalDebits - totalCredits : totalCredits - totalDebits;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Professional Registry
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">General Ledgers</h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          T-Account ledgers dynamically derived from canonical journal postings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Left: Accounts selector */}
        <div className="md:col-span-1 space-y-2">
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest px-1">
            Accounts ({accounts.length})
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl divide-y divide-zinc-800/60 overflow-hidden max-h-[600px] overflow-y-auto">
            {accounts.map((acc) => {
              const isSelected = acc.name.toLowerCase() === selectedAccountName.toLowerCase();
              return (
                <button
                  key={acc.code}
                  onClick={() => setSelectedAccountName(acc.name)}
                  className={`w-full p-3.5 text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-zinc-800/90 border-l-2 border-emerald-400 font-bold text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono text-zinc-500 text-[10px] mr-2">{acc.code}</span>
                    <span className="truncate">{acc.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-800 shrink-0">
                    {acc.type.substring(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Ledger Details (T-Account representation) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/80">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  ACCOUNT CODE: {selectedAcc?.code || '—'}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedAccountName} Ledger</h3>
                <p className="text-xs text-zinc-400 font-mono capitalize mt-1">
                  Classification: {selectedAcc?.type || 'Asset'} • Normal Balance:{' '}
                  {isNormalDebit ? 'Debit' : 'Credit'}
                </p>
              </div>

              {/* Net Balance Pill */}
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-right">
                <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-widest block">
                  Net Ledger Balance
                </span>
                <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                  {activeEntity.baseCurrency} {currentNetBalance.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-emerald-400">
                    ({isNormalDebit ? (currentNetBalance >= 0 ? 'Dr' : 'Cr') : currentNetBalance >= 0 ? 'Cr' : 'Dr'})
                  </span>
                </span>
              </div>
            </div>

            {/* Postings Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 whitespace-nowrap">Date</th>
                    <th className="py-3 px-3 whitespace-nowrap">Tx ID</th>
                    <th className="py-3 px-3">Description / Contra Entry</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">Debit ({activeEntity.baseCurrency})</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">Credit ({activeEntity.baseCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {postings.map((p, idx) => (
                    <tr
                      key={idx}
                      onClick={() => onInspectTransaction(p.tx)}
                      className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">{p.date}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400 whitespace-nowrap">{p.txId}</td>
                      <td className="py-3 px-3 font-sans font-medium text-white">
                        {p.description}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-200 whitespace-nowrap">
                        {p.debit > 0 ? p.debit.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-200 whitespace-nowrap">
                        {p.credit > 0 ? p.credit.toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}

                  {postings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono">
                        No postings in this ledger yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-zinc-950/70 font-mono font-bold border-t border-zinc-800">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-zinc-400 uppercase tracking-wider text-[11px]">
                      Total Ledger Activity
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400">
                      {totalDebits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400">
                      {totalCredits.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
