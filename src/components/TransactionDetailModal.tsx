import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Clock,
  MessageSquare,
  ShieldCheck,
  Ban,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CanonicalTransaction } from '../types';
import { useAccounting } from '../context/AccountingContext';

interface TransactionDetailModalProps {
  transaction: CanonicalTransaction | null;
  onClose: () => void;
  onNavigateToBook?: (bookName: string) => void;
  onNavigateToLedger?: (accountName: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onNavigateToBook,
  onNavigateToLedger,
}) => {
  const { voidTransaction, addPersonComment, experienceLevel } = useAccounting();

  const [commentText, setCommentText] = useState('');
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  if (!transaction) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addPersonComment(transaction.id, commentText.trim());
    setCommentText('');
  };

  const handleConfirmVoid = () => {
    if (!voidReason.trim()) return;
    voidTransaction(transaction.id, voidReason.trim());
    setVoidModalOpen(false);
    onClose();
  };

  const totalDebits = transaction.journalLines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredits = transaction.journalLines.reduce((s, l) => s + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                {transaction.id}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  transaction.status === 'posted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : transaction.status === 'voided'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 mt-1">{transaction.description}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
          {/* Section: What Happened (Human-Friendly Summary) */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
              What Happened
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
              <div>
                <div className="text-xs text-stone-500">Amount</div>
                <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Payment / Account</div>
                <div className="text-sm font-semibold text-stone-900 mt-0.5">
                  {transaction.paymentMethod}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Date</div>
                <div className="text-sm font-semibold text-stone-900 mt-0.5">{transaction.date}</div>
              </div>
            </div>

            <div className="text-xs text-stone-600">
              <span className="font-semibold text-stone-700">Original Prompt:</span> &ldquo;
              {transaction.originalInput}&rdquo;
            </div>

            {transaction.counterparty && (
              <div className="text-xs text-stone-600">
                <span className="font-semibold text-stone-700">Counterparty:</span>{' '}
                {transaction.counterparty} ({transaction.counterpartyRole})
              </div>
            )}
          </div>

          {/* Section: Accounting Details (Double-Entry Breakdown) */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Accounting Treatment
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {isBalanced ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Double-Entry Verified ({transaction.currency} {totalDebits.toLocaleString()})
                  </span>
                ) : (
                  <span className="text-rose-700 font-medium">Imbalance detected!</span>
                )}
              </div>
            </div>

            {/* Double Entry Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Account</th>
                    <th className="py-2 px-3 text-right">Debit ({transaction.currency})</th>
                    <th className="py-2 px-3 text-right">Credit ({transaction.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transaction.journalLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/80 font-mono">
                      <td className="py-2 px-3 font-sans font-medium text-stone-900">
                        {line.accountName}
                      </td>
                      <td className="py-2 px-3 text-right text-stone-900">
                        {line.debit > 0 ? line.debit.toLocaleString() : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-stone-900">
                        {line.credit > 0 ? line.credit.toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50 font-bold border-t border-stone-200">
                  <tr>
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3 text-right font-mono">{totalDebits.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono">{totalCredits.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Plain Language Explanation */}
            <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-blue-950">System Classification Rationale:</span>
                <span>{transaction.explanation}</span>
              </div>
            </div>

            {/* Where It Appears */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 space-y-1.5 text-xs">
              <span className="font-semibold text-stone-700 block">Synchronized Across Books & Ledgers:</span>
              <div className="grid grid-cols-2 gap-2 text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">•</span>
                  <span>Book of Prime Entry: <strong>{transaction.relevantBook}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">•</span>
                  <span>General Journal: <strong>Posted</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">•</span>
                  <span>
                    Ledgers: {transaction.journalLines.map((l) => l.accountName).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">•</span>
                  <span>Trial Balance: <strong>Balanced</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Timeline */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Transaction Timeline
            </div>
            <div className="space-y-2 pl-2 border-l-2 border-stone-200 ml-1">
              {transaction.timeline.map((step, idx) => (
                <div key={idx} className="relative pl-3">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-stone-400 ring-2 ring-white" />
                  <div className="text-xs font-semibold text-stone-800">{step.label}</div>
                  <div className="text-[11px] text-stone-400">
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Comments */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Team Comments
            </div>

            {transaction.comments.length > 0 ? (
              <div className="space-y-2">
                {transaction.comments.map((cmt) => (
                  <div key={cmt.id} className="p-2.5 bg-stone-50 rounded-lg text-xs border border-stone-200">
                    <div className="flex items-center justify-between font-semibold text-stone-900">
                      <span>{cmt.author}</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {new Date(cmt.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-stone-700 mt-1">{cmt.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-400 italic">No comments on this record yet.</div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add professional or accounting note..."
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-black disabled:opacity-30"
              >
                Comment
              </button>
            </form>
          </div>
        </div>

        {/* Footer: Close & Void Action */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div>
            {transaction.status !== 'voided' && (
              <button
                onClick={() => setVoidModalOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                title="Create reversing entry to void transaction without deleting history"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Void Transaction (No Destructive Delete)</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Confirmation Modal for Voiding */}
        {voidModalOpen && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 flex flex-col justify-center items-center text-center z-50">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Ban className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Void Accounting Transaction</h4>
            <p className="text-xs text-stone-600 max-w-md mt-1">
              Transactions are never destroyed or deleted permanently. Voiding creates an auditable reversal journal entry.
            </p>
            <div className="w-full max-w-sm mt-4 text-left">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Reason for reversal:
              </label>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Inadvertent duplicate entry or cancelled order"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setVoidModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoid}
                disabled={!voidReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-40"
              >
                Confirm Void & Reversal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
