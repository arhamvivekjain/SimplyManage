import React from 'react';
import { Scale, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const TrialBalancePage: React.FC = () => {
  const { trialBalance, activeEntity } = useAccounting();

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Professional Verification
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Trial Balance</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Double-entry invariant check: Every transaction posted must satisfy Total Debits = Total Credits.
          </p>
        </div>

        {/* Invariant Status Badge */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold self-start sm:self-auto ${
            trialBalance.isBalanced
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {trialBalance.isBalanced ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>BALANCED (0 IMBALANCE)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>IMBALANCE DETECTED</span>
            </>
          )}
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            {activeEntity.name} • As of {new Date().toLocaleDateString()}
          </div>
          <span className="text-xs text-zinc-500">CURRENCY: {activeEntity.baseCurrency}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Code</th>
                <th className="py-3.5 px-4">Account Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Type</th>
                <th className="py-3.5 px-4 text-right font-mono whitespace-nowrap">Debit ({activeEntity.baseCurrency})</th>
                <th className="py-3.5 px-5 text-right font-mono whitespace-nowrap">Credit ({activeEntity.baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {trialBalance.items.map((item) => (
                <tr key={item.accountName} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-5 text-zinc-500 whitespace-nowrap">{item.accountCode}</td>
                  <td className="py-3 px-4 font-sans font-medium text-white">{item.accountName}</td>
                  <td className="py-3 px-4 capitalize whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 uppercase">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-200 font-medium whitespace-nowrap">
                    {item.debit > 0 ? item.debit.toLocaleString() : '—'}
                  </td>
                  <td className="py-3 px-5 text-right text-zinc-200 font-medium whitespace-nowrap">
                    {item.credit > 0 ? item.credit.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-zinc-950/80 font-mono font-bold border-t-2 border-zinc-800 text-sm">
              <tr>
                <td colSpan={3} className="py-3.5 px-5 text-white uppercase tracking-wider text-xs">
                  Total Trial Balance
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 whitespace-nowrap">
                  {trialBalance.totalDebits.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-right font-mono text-emerald-400 whitespace-nowrap">
                  {trialBalance.totalCredits.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-6 bg-zinc-900/40 rounded-3xl border border-zinc-800 text-xs text-zinc-400 space-y-2">
        <h4 className="font-bold text-white font-mono uppercase tracking-widest text-xs">
          The SimplyManage Double-Entry Guarantee
        </h4>
        <p className="font-sans leading-relaxed text-zinc-400">
          Whether a transaction is entered via natural language (&ldquo;Bought a MacBook for AED 6,000 from Amazon using Emirates NBD&rdquo;) or created as a manual journal entry, the deterministic accounting engine enforces that every debit has a matching credit.
        </p>
      </div>
    </div>
  );
};
