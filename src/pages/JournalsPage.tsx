import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle2, AlertCircle, X, Layers } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CanonicalTransaction } from '../types';

interface JournalsPageProps {
  onInspectTransaction: (tx: CanonicalTransaction) => void;
}

export const JournalsPage: React.FC<JournalsPageProps> = ({ onInspectTransaction }) => {
  const { transactions, activeEntity, postCanonicalTransaction, accounts } = useAccounting();

  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [entryDesc, setEntryDesc] = useState('');
  const [lines, setLines] = useState([
    { accountName: 'Rent Expense', debit: 5000, credit: 0 },
    { accountName: 'Emirates NBD', debit: 0, credit: 5000 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const postedTx = transactions.filter((t) => t.status === 'posted');

  const totalDebits = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const handlePostManualJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setFormError('Cannot post: Total Debits must equal Total Credits (Double-entry invariant).');
      return;
    }
    if (!entryDesc.trim()) {
      setFormError('Description is required.');
      return;
    }

    const journalLines = lines.map((l) => ({
      accountCode: '9999',
      accountName: l.accountName,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
    }));

    const result = postCanonicalTransaction({
      originalInput: `Manual Journal Entry: ${entryDesc}`,
      description: entryDesc,
      amount: totalDebits,
      currency: activeEntity.baseCurrency,
      counterparty: 'General',
      paymentMethod: 'Journal',
      transactionType: 'expense',
      journalLines,
      relevantBook: 'General Journal',
      explanation: 'Manual professional journal entry entered by accountant.',
    });

    if (result.success) {
      setManualModalOpen(false);
      setEntryDesc('');
      setFormError(null);
    } else {
      setFormError(result.error || 'Failed to post journal entry.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Professional Ledger
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">General Journal</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Every transaction forms a balanced debit and credit journal entry with complete auditability.
          </p>
        </div>

        <button
          onClick={() => setManualModalOpen(true)}
          className="px-3.5 py-2 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>MANUAL JOURNAL ENTRY</span>
        </button>
      </div>

      {/* Mobile Journal Cards (md:hidden) */}
      <div className="block md:hidden space-y-3">
        {postedTx.map((tx) => (
          <div
            key={tx.id}
            onClick={() => onInspectTransaction(tx)}
            className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-emerald-400">{tx.id}</span>
              <span className="text-zinc-400">{tx.date}</span>
            </div>
            <div className="text-xs text-zinc-300 font-medium">
              {tx.description}
            </div>
            <div className="bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800/80 space-y-1.5 font-mono text-xs">
              {tx.journalLines.map((line, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className={line.credit > 0 ? 'pl-3 text-zinc-400' : 'text-zinc-200 font-semibold'}>
                    {line.accountName}
                  </span>
                  <span className={line.debit > 0 ? 'text-emerald-400' : 'text-zinc-300'}>
                    {line.debit > 0
                      ? `Dr ${line.debit.toLocaleString()}`
                      : `Cr ${line.credit.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
            {tx.explanation && (
              <div className="text-[11px] text-zinc-500 font-mono italic">
                {tx.explanation}
              </div>
            )}
          </div>
        ))}
        {postedTx.length === 0 && (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs bg-zinc-900/20 border border-zinc-800/80 rounded-2xl">
            Nothing posted to the General Journal yet.
          </div>
        )}
      </div>

      {/* Desktop & Tablet Table (hidden md:block) */}
      <div className="hidden md:block bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5 w-28 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 w-32 whitespace-nowrap">Voucher / ID</th>
                <th className="py-3.5 px-4">Account & Particulars</th>
                <th className="py-3.5 px-4 text-right w-36 whitespace-nowrap">Debit ({activeEntity.baseCurrency})</th>
                <th className="py-3.5 px-5 text-right w-36 whitespace-nowrap">Credit ({activeEntity.baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {postedTx.map((tx) => (
                <React.Fragment key={tx.id}>
                  {/* Journal Lines for this transaction */}
                  {tx.journalLines.map((line, idx) => (
                    <tr
                      key={`${tx.id}-${idx}`}
                      onClick={() => onInspectTransaction(tx)}
                      className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    >
                      {idx === 0 && (
                        <td
                          rowSpan={tx.journalLines.length + 1}
                          className="py-3.5 px-5 align-top text-zinc-400 font-mono border-r border-zinc-800/80 whitespace-nowrap bg-zinc-950/30"
                        >
                          {tx.date}
                        </td>
                      )}
                      {idx === 0 && (
                        <td
                          rowSpan={tx.journalLines.length + 1}
                          className="py-3.5 px-4 align-top font-mono font-bold text-emerald-400 border-r border-zinc-800/80 bg-zinc-950/30 whitespace-nowrap"
                        >
                          {tx.id}
                        </td>
                      )}

                      <td className="py-2.5 px-4 font-sans font-medium text-white">
                        <span className={line.credit > 0 ? 'pl-6 block text-zinc-400' : 'block text-white'}>
                          {line.accountName}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-zinc-200 whitespace-nowrap">
                        {line.debit > 0 ? line.debit.toLocaleString() : ''}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono font-medium text-zinc-200 whitespace-nowrap">
                        {line.credit > 0 ? line.credit.toLocaleString() : ''}
                      </td>
                    </tr>
                  ))}

                  {/* Narration Row */}
                  <tr
                    onClick={() => onInspectTransaction(tx)}
                    className="hover:bg-zinc-800/40 cursor-pointer bg-zinc-950/20"
                  >
                    <td
                      colSpan={3}
                      className="py-2 px-4 text-[11px] text-zinc-500 font-mono italic pb-4 border-b border-zinc-800/80"
                    >
                      (Narration: {tx.description}. {tx.explanation})
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {postedTx.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono">
                    Nothing posted to the General Journal yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Journal Entry Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono">Manual Journal Entry</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Double-entry booking</p>
              </div>
              <button onClick={() => setManualModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostManualJournal} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Description / Narration
                </label>
                <input
                  type="text"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  placeholder="e.g. Accrued monthly software expense or capital injection"
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              {/* Debit Line */}
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                  Debit Entry
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={lines[0].accountName}
                    onChange={(e) => {
                      const copy = [...lines];
                      copy[0].accountName = e.target.value;
                      setLines(copy);
                    }}
                    placeholder="Debit Account Name"
                    className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none font-mono"
                    required
                  />
                  <input
                    type="number"
                    value={lines[0].debit}
                    onChange={(e) => {
                      const copy = [...lines];
                      copy[0].debit = parseFloat(e.target.value) || 0;
                      setLines(copy);
                    }}
                    placeholder="Debit Amount"
                    className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-right text-emerald-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Credit Line */}
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                  Credit Entry
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={lines[1].accountName}
                    onChange={(e) => {
                      const copy = [...lines];
                      copy[1].accountName = e.target.value;
                      setLines(copy);
                    }}
                    placeholder="Credit Account Name"
                    className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none font-mono"
                    required
                  />
                  <input
                    type="number"
                    value={lines[1].credit}
                    onChange={(e) => {
                      const copy = [...lines];
                      copy[1].credit = parseFloat(e.target.value) || 0;
                      setLines(copy);
                    }}
                    placeholder="Credit Amount"
                    className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-right text-emerald-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Invariant indicator */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
                <span className="text-zinc-400">Debits: <strong className="text-white">{totalDebits}</strong></span>
                <span className="text-zinc-400">Credits: <strong className="text-white">{totalCredits}</strong></span>
                <span className={isBalanced ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isBalanced ? '✓ Balanced' : '✗ Imbalance'}
                </span>
              </div>

              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-mono">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="px-4 py-2 text-xs font-mono font-bold bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-30 transition-colors"
                >
                  VALIDATE & POST JOURNAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
