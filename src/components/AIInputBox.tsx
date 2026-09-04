import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileText,
  BookOpen,
  Layers,
  Clock,
  Loader2,
  Tag,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { interpretNaturalLanguage } from '../ai/client';
import { CanonicalTransaction } from '../types';

interface AIInputBoxProps {
  onTransactionCreated?: (tx: CanonicalTransaction) => void;
  onInspectTransaction?: (tx: CanonicalTransaction) => void;
}

export const AIInputBox: React.FC<AIInputBoxProps> = ({
  onTransactionCreated,
  onInspectTransaction,
}) => {
  const { postCanonicalTransaction, activeEntity, accounts } = useAccounting();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Clarification state machine
  const [clarificationStage, setClarificationStage] = useState<{
    originalInput: string;
    question: string;
    accumulatedData: Partial<CanonicalTransaction>;
  } | null>(null);

  // Absurd value verification dialog
  const [absurdWarning, setAbsurdWarning] = useState<{
    question: string;
    proposedTx: Partial<CanonicalTransaction>;
  } | null>(null);

  // Success state feedback
  const [lastPosted, setLastPosted] = useState<{
    tx: CanonicalTransaction;
    duplicateWarning?: CanonicalTransaction;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcessInput = async (textToProcess?: string) => {
    const rawText = textToProcess || input;
    if (!rawText.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setLastPosted(null);

    try {
      // If we are currently in clarification stage
      if (clarificationStage) {
        const fullContext = `${clarificationStage.originalInput}. Answer: ${rawText}`;
        const response = await interpretNaturalLanguage(fullContext, activeEntity.baseCurrency, accounts);

        if (response.needsClarification && response.clarificationQuestion) {
          setClarificationStage({
            originalInput: fullContext,
            question: response.clarificationQuestion,
            accumulatedData: {
              ...clarificationStage.accumulatedData,
              ...response,
            },
          });
          setInput('');
          setLoading(false);
          return;
        }

        // Ready to post
        commitTransaction({
          ...clarificationStage.accumulatedData,
          ...response,
          originalInput: fullContext,
        });
        setClarificationStage(null);
        setInput('');
        setLoading(false);
        return;
      }

      // Fresh input
      const aiResult = await interpretNaturalLanguage(rawText, activeEntity.baseCurrency, accounts);

      // Absurd value detection
      if (aiResult.isAbsurdValue && aiResult.absurdValueQuestion) {
        setAbsurdWarning({
          question: aiResult.absurdValueQuestion,
          proposedTx: {
            ...aiResult,
            originalInput: rawText,
            journalLines: aiResult.proposedJournal.map((pj) => ({
              accountCode: pj.account.includes('Equipment') ? '1050' : '5060',
              accountName: pj.account,
              debit: pj.debit,
              credit: pj.credit,
            })),
          },
        });
        setLoading(false);
        return;
      }

      // Clarification required
      if (aiResult.needsClarification && aiResult.clarificationQuestion) {
        setClarificationStage({
          originalInput: rawText,
          question: aiResult.clarificationQuestion,
          accumulatedData: {
            originalInput: rawText,
            description: aiResult.description,
            counterparty: aiResult.counterparty,
            paymentMethod: aiResult.paymentMethod,
            amount: aiResult.amount || undefined,
            transactionType: aiResult.transactionType,
          },
        });
        setInput('');
        setLoading(false);
        return;
      }

      // Valid structured proposal -> deterministic engine commit
      commitTransaction({
        originalInput: rawText,
        description: aiResult.description,
        amount: aiResult.amount || 0,
        currency: aiResult.currency || activeEntity.baseCurrency,
        counterparty: aiResult.counterparty,
        counterpartyRole: aiResult.counterpartyRole || 'supplier',
        paymentMethod: aiResult.paymentMethod || 'Emirates NBD',
        transactionType: aiResult.transactionType || 'expense',
        isAsset: aiResult.isAsset,
        journalLines: (aiResult.proposedJournal || []).map((pj) => ({
          accountCode: pj.account.includes('Equipment') ? '1050' : '1020',
          accountName: pj.account,
          debit: pj.debit,
          credit: pj.credit,
        })),
        explanation: aiResult.explanation,
      });

      setInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not interpret input.');
    } finally {
      setLoading(false);
    }
  };

  const commitTransaction = (txData: Partial<CanonicalTransaction>) => {
    // If journalLines are empty, build standard double-entry pair
    if (!txData.journalLines || txData.journalLines.length === 0) {
      const amt = txData.amount || 0;
      const pm = txData.paymentMethod || 'Emirates NBD';

      if (txData.transactionType === 'receivable') {
        txData.journalLines = [
          { accountCode: '1030', accountName: `Accounts Receivable (${txData.counterparty || 'Client'})`, debit: amt, credit: 0 },
          { accountCode: '4020', accountName: 'Services Income', debit: 0, credit: amt },
        ];
      } else if (txData.transactionType === 'payable') {
        txData.journalLines = [
          { accountCode: '2010', accountName: `Accounts Payable (${txData.counterparty || 'Vendor'})`, debit: amt, credit: 0 },
          { accountCode: '1020', accountName: pm, debit: 0, credit: amt },
        ];
      } else if (txData.transactionType === 'refund') {
        txData.journalLines = [
          { accountCode: '1020', accountName: pm, debit: amt, credit: 0 },
          { accountCode: '1050', accountName: 'Equipment / Purchases Returns', debit: 0, credit: amt },
        ];
      } else if (txData.isAsset) {
        txData.journalLines = [
          { accountCode: '1050', accountName: 'Equipment', debit: amt, credit: 0 },
          { accountCode: '1020', accountName: pm, debit: 0, credit: amt },
        ];
      } else {
        txData.journalLines = [
          { accountCode: '5060', accountName: 'Operating Expense', debit: amt, credit: 0 },
          { accountCode: '1020', accountName: pm, debit: 0, credit: amt },
        ];
      }
    }

    const result = postCanonicalTransaction(txData);

    if (result.success && result.transaction) {
      setLastPosted({
        tx: result.transaction,
        duplicateWarning: result.duplicateWarning,
      });
      if (onTransactionCreated) onTransactionCreated(result.transaction);
    } else {
      setErrorMessage(result.error || 'The transaction could not be recorded.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      {/* Main Input Card (Bento Grid dark surface) */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-800 overflow-hidden transition-all focus-within:border-zinc-700 shadow-sm">
        <div className="p-5 sm:p-6">
          {/* Label / Prompt Header */}
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="ai-input"
              className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {clarificationStage ? 'Clarification Required' : 'Enter Transaction'}
            </label>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">
              Natural Language → Deterministic Core
            </span>
          </div>

          {/* Clarification Prompt Banner */}
          {clarificationStage && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block text-amber-200">One thing I need to know:</span>
                <span className="font-medium text-amber-300 text-sm mt-0.5 block">{clarificationStage.question}</span>
                <div className="text-[11px] text-amber-400/80 font-mono mt-1.5">
                  Context: &ldquo;{clarificationStage.originalInput}&rdquo;
                </div>
              </div>
            </div>
          )}

          {/* Absurd Value Detection Banner */}
          {absurdWarning && (
            <div className="mb-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="text-xs flex-1">
                  <span className="font-semibold block text-orange-200 font-mono uppercase tracking-wider">
                    Discrepancy Check:
                  </span>
                  <p className="mt-1 text-orange-300 font-medium">{absurdWarning.question}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        commitTransaction({
                          ...absurdWarning.proposedTx,
                          description: 'Apple (Produce/Groceries)',
                        });
                        setAbsurdWarning(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition-colors"
                    >
                      Yes, Fruit / Produce
                    </button>
                    <button
                      onClick={() => {
                        commitTransaction({
                          ...absurdWarning.proposedTx,
                          description: 'Apple Electronics / Accessory',
                          isAsset: true,
                        });
                        setAbsurdWarning(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Apple Tech / Asset
                    </button>
                    <button
                      onClick={() => setAbsurdWarning(null)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex items-center">
            <input
              id="ai-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleProcessInput();
                }
              }}
              placeholder={
                clarificationStage
                  ? 'Type your answer (e.g. AED 6,000 or Emirates NBD)...'
                  : 'e.g. Bought a MacBook for AED 6,000 from Amazon using Emirates NBD'
              }
              className="w-full pl-4 pr-24 py-3.5 text-zinc-100 placeholder:text-zinc-500 text-sm sm:text-base font-normal bg-zinc-950/80 rounded-2xl border border-zinc-800 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-colors"
              disabled={loading}
              autoFocus
            />

            <button
              onClick={() => handleProcessInput()}
              disabled={loading || !input.trim()}
              className="absolute right-2 px-3.5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>RECORD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Example Chips for One-Touch Testing */}
          <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-zinc-500">Quick test:</span>
            {[
              {
                label: 'MacBook AED 6k',
                text: 'Bought a MacBook from Amazon for AED 6,000 using Emirates NBD.',
              },
              {
                label: 'Sarah AED 750',
                text: 'Sarah owes me AED 750 for design work.',
              },
              {
                label: 'Paid John AED 500',
                text: 'I paid John AED 500 that I owed him.',
              },
              {
                label: 'Amazon refund',
                text: 'Amazon refunded AED 400.',
              },
              {
                label: 'Clarification',
                text: 'Bought a MacBook.',
              },
              {
                label: 'Absurd check',
                text: 'Bought an Apple for AED 123.40.',
              },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  setInput(chip.text);
                  handleProcessInput(chip.text);
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Machine-like Output Result */}
        {lastPosted && (
          <div className="border-t border-zinc-800 bg-zinc-950/70 p-5 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    ✓ RECORDED TO BOOKS
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {lastPosted.tx.description}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    {lastPosted.tx.currency} {lastPosted.tx.amount.toLocaleString()} • {lastPosted.tx.counterparty} • Paid via {lastPosted.tx.paymentMethod}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 italic">
                    {lastPosted.tx.explanation}
                  </div>

                  {lastPosted.duplicateWarning && (
                    <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 font-mono">
                      ⚠️ Duplicate Note: A similar transaction was previously recorded ({lastPosted.duplicateWarning.id}).
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Open details */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onInspectTransaction) onInspectTransaction(lastPosted.tx);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Accounting</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="border-t border-rose-900/50 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
