import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CanonicalTransaction } from '../types';

interface MoneyPageProps {
  onInspectTransaction: (tx: CanonicalTransaction) => void;
}

export const MoneyPage: React.FC<MoneyPageProps> = ({ onInspectTransaction }) => {
  const { accounts, transactions, activeEntity, postCanonicalTransaction } = useAccounting();

  // Filter cash and bank accounts (Asset codes starting with 1010, 1020, etc.)
  const liquidAccounts = accounts.filter(
    (a) => a.type === 'asset' && (a.code === '1010' || a.code === '1020' || a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('cash'))
  );

  const totalLiquidity = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Cash transactions (Cash Book or affecting liquid accounts)
  const cashTransactions = transactions.filter(
    (t) =>
      t.relevantBook === 'Cash Book' ||
      t.relevantBook === 'Petty Cash Book' ||
      t.paymentMethod.toLowerCase().includes('cash') ||
      t.paymentMethod.toLowerCase().includes('bank') ||
      t.paymentMethod.toLowerCase().includes('emirates')
  );

  const totalInflows = cashTransactions
    .filter((t) => t.transactionType === 'income' || t.transactionType === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflows = cashTransactions
    .filter((t) => t.transactionType === 'expense' || t.transactionType === 'payable')
    .reduce((sum, t) => sum + t.amount, 0);

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(500);
  const [fromAccount, setFromAccount] = useState(liquidAccounts[0]?.name || 'Emirates NBD');
  const [toAccount, setToAccount] = useState(liquidAccounts[1]?.name || 'Cash on Hand');
  const [transferDesc, setTransferDesc] = useState('Transfer to petty cash');

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmount <= 0) return;

    postCanonicalTransaction({
      originalInput: `Transferred ${activeEntity.baseCurrency} ${transferAmount} from ${fromAccount} to ${toAccount}`,
      description: transferDesc || `Transfer from ${fromAccount} to ${toAccount}`,
      amount: transferAmount,
      currency: activeEntity.baseCurrency,
      counterparty: 'Internal Transfer',
      counterpartyRole: 'other',
      paymentMethod: fromAccount,
      transactionType: 'transfer',
      journalLines: [
        { accountCode: '1010', accountName: toAccount, debit: transferAmount, credit: 0 },
        { accountCode: '1020', accountName: fromAccount, debit: 0, credit: transferAmount },
      ],
      relevantBook: 'Cash Book',
      explanation: `Internal liquidity transfer of ${activeEntity.baseCurrency} ${transferAmount} between ${fromAccount} and ${toAccount}.`,
    });

    setShowTransferModal(false);
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Management Liquidity
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Money & Cash Flow
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-0.5">
            Real-time liquid reserves, bank balances, and cash movements for {activeEntity.name}.
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-[0.99]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Internal Transfer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-medium">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Total Liquid Reserves
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Cash & Bank
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {activeEntity.baseCurrency} {totalLiquidity.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Available across {liquidAccounts.length} designated liquid accounts
          </div>
        </div>

        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowDownLeft className="w-4 h-4 text-blue-400" />
              Total Recorded Inflows
            </span>
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Collections
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {activeEntity.baseCurrency} {totalInflows.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Client receipts and revenue deposits
          </div>
        </div>

        <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              Total Recorded Outflows
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Disbursements
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {activeEntity.baseCurrency} {totalOutflows.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Vendor payments, expenses, and asset investments
          </div>
        </div>
      </div>

      {/* Liquid Accounts Grid */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Landmark className="w-4 h-4 text-zinc-400" />
          Liquid Account Balances
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liquidAccounts.map((account) => (
            <div
              key={account.code}
              className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">Code {account.code}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {account.type}
                </span>
              </div>
              <div className="text-sm font-bold text-white">{account.name}</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 pt-1 border-t border-zinc-800/60">
                {activeEntity.baseCurrency} {account.balance.toLocaleString()}
              </div>
            </div>
          ))}

          {liquidAccounts.length === 0 && (
            <div className="col-span-full py-8 text-center text-zinc-500 font-mono text-xs">
              No cash or bank accounts established yet. Set up in Organization or Setup.
            </div>
          )}
        </div>
      </div>

      {/* Cash Movement Stream */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Cash Movements</h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Entries routed through the Cash Book & Bank register
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {cashTransactions.length} movements
          </span>
        </div>

        {/* Mobile View (md:hidden) */}
        <div className="block md:hidden divide-y divide-zinc-800/60 font-mono p-3 space-y-3">
          {cashTransactions.map((tx) => (
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
                <span className="text-zinc-400 font-sans">{tx.paymentMethod}</span>
                <span className="font-bold text-white">
                  {activeEntity.baseCurrency} {tx.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {cashTransactions.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              No cash movements recorded yet.
            </div>
          )}
        </div>

        {/* Desktop View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Account / Method</th>
                <th className="py-3.5 px-4">Counterparty</th>
                <th className="py-3.5 px-5 text-right">Amount ({activeEntity.baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {cashTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onInspectTransaction(tx)}
                  className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 text-zinc-400">{tx.date}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{tx.id}</td>
                  <td className="py-3.5 px-4 font-sans font-medium text-white">{tx.description}</td>
                  <td className="py-3.5 px-4 text-zinc-300">{tx.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-sans text-zinc-400">{tx.counterparty || '—'}</td>
                  <td className="py-3.5 px-5 text-right font-bold text-white">
                    {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {cashTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono text-xs">
                    No cash movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Record Internal Transfer</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Transfer Amount ({activeEntity.baseCurrency})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Source (From Account)</label>
                <input
                  type="text"
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Destination (To Account)</label>
                <input
                  type="text"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Memo / Description</label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
