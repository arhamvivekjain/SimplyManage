import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  DollarSign,
  X,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice } from '../types';

interface InvoicesPageProps {
  onOpenCreateInvoice: () => void;
  onOpenScanReceipt: () => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({
  onOpenCreateInvoice,
  onOpenScanReceipt,
}) => {
  const { invoices, activeEntity, recordPaymentForInvoice } = useAccounting();

  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Emirates NBD');

  const handleRecordPartialPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) return;

    recordPaymentForInvoice(paymentModalInvoice.id, amt, payMethod);
    setPaymentModalInvoice(null);
    setPayAmount('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
            Receivables & Billing Pipeline
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Invoices</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Create, track, and record partial or full payments. Synchronizes with accounts receivable.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenScanReceipt}
            className="px-3.5 py-2 text-xs font-mono font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>SCAN RECEIPT</span>
          </button>
          <button
            onClick={onOpenCreateInvoice}
            className="px-3.5 py-2 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE INVOICE</span>
          </button>
        </div>
      </div>

      {/* Mobile Invoice Cards (md:hidden) */}
      <div className="block md:hidden space-y-3">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-emerald-400">{inv.invoiceNumber}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  inv.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : inv.status === 'partial'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {inv.status}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{inv.counterparty}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{inv.description}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 font-mono text-xs text-center">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Total</div>
                <div className="font-bold text-white mt-0.5">{inv.currency} {inv.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Paid</div>
                <div className="font-bold text-emerald-400 mt-0.5">{inv.currency} {inv.paidAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Due</div>
                <div className="font-bold text-zinc-200 mt-0.5">{inv.currency} {inv.remainingAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">Due: {inv.dueDate}</span>
              {inv.remainingAmount > 0 ? (
                <button
                  onClick={() => {
                    setPaymentModalInvoice(inv);
                    setPayAmount(inv.remainingAmount.toString());
                  }}
                  className="px-3 py-1 text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
                >
                  Record Payment
                </button>
              ) : (
                <span className="text-xs font-mono text-emerald-400 font-semibold">Settled</span>
              )}
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-zinc-900/20 border border-zinc-800/80 rounded-2xl">
            No invoices generated yet. Use &ldquo;Create Invoice&rdquo; above.
          </div>
        )}
      </div>

      {/* Desktop Invoices Table (hidden md:block) */}
      <div className="hidden md:block bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Invoice #</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Customer</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Total</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Paid</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Remaining</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-emerald-400 whitespace-nowrap">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-medium text-white whitespace-nowrap">{inv.counterparty}</td>
                  <td className="py-3.5 px-4 text-zinc-300">{inv.description}</td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono whitespace-nowrap">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                    {inv.currency} {inv.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 whitespace-nowrap">
                    {inv.currency} {inv.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-200 whitespace-nowrap">
                    {inv.currency} {inv.remainingAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : inv.status === 'partial'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {inv.remainingAmount > 0 && (
                      <button
                        onClick={() => {
                          setPaymentModalInvoice(inv);
                          setPayAmount(inv.remainingAmount.toString());
                        }}
                        className="px-3 py-1 text-[11px] font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl transition-colors"
                      >
                        Record Payment
                      </button>
                    )}
                    {inv.remainingAmount === 0 && (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">Settled</span>
                    )}
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 font-mono">
                    No invoices generated yet. Use &ldquo;Create Invoice&rdquo; above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment on Invoice Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-mono">
                  Record Payment: {paymentModalInvoice.invoiceNumber}
                </h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {paymentModalInvoice.counterparty} • Total: {paymentModalInvoice.currency}{' '}
                  {paymentModalInvoice.amount}
                </p>
              </div>
              <button onClick={() => setPaymentModalInvoice(null)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPartialPayment} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Payment Amount ({paymentModalInvoice.currency})
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  max={paymentModalInvoice.remainingAmount}
                  placeholder={`Max: ${paymentModalInvoice.remainingAmount}`}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <span className="text-[11px] font-mono text-zinc-500 mt-1.5 block">
                  Remaining balance after this:{' '}
                  <strong className="text-zinc-300">
                    {paymentModalInvoice.currency}{' '}
                    {Math.max(0, paymentModalInvoice.remainingAmount - (parseFloat(payAmount) || 0)).toLocaleString()}
                  </strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Payment Account
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="Emirates NBD">Emirates NBD Bank</option>
                  <option value="Cash">Cash on Hand</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-mono font-bold bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl transition-colors"
                >
                  POST PAYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
