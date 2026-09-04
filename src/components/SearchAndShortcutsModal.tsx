import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  ArrowRight,
  BookOpen,
  Layers,
  User,
  DollarSign,
  Calendar,
  Sparkles,
  Command,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { askAIQuestion } from '../ai/client';
import { CanonicalTransaction } from '../types';

interface SearchAndShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: (tx: CanonicalTransaction) => void;
  onNavigateToTab: (tab: string) => void;
}

export const SearchAndShortcutsModal: React.FC<SearchAndShortcutsModalProps> = ({
  isOpen,
  onClose,
  onSelectTransaction,
  onNavigateToTab,
}) => {
  const { transactions, people, accounts, activeEntity } = useAccounting();

  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setAiAnswer(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter transactions
  const matchedTx = transactions.filter((t) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      t.counterparty.toLowerCase().includes(q) ||
      t.originalInput.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.paymentMethod.toLowerCase().includes(q)
    );
  });

  // Filter people
  const matchedPeople = people.filter((p) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q);
  });

  // Filter accounts
  const matchedAccounts = accounts.filter((a) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.code.includes(q);
  });

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setIsAskingAi(true);
    setAiAnswer(null);
    try {
      const answer = await askAIQuestion(query, transactions, people, accounts);
      setAiAnswer(answer);
    } finally {
      setIsAskingAi(false);
    }
  };

  const isQuestion =
    query.endsWith('?') ||
    /^(when|who|what|how much|show|where)/i.test(query.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50/70">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isQuestion) handleAskAI();
              }
              if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Search transactions, ask AI questions (e.g. 'When did I buy my MacBook?')..."
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setAiAnswer(null);
              }}
              className="p-1 text-stone-400 hover:text-stone-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-medium text-stone-500 hover:text-stone-800 px-2 py-1 bg-white border border-stone-200 rounded-md"
          >
            Esc
          </button>
        </div>

        {/* AI Answer Card */}
        {(isQuestion || aiAnswer || isAskingAi) && (
          <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900">SimplyManage AI Data Answer</span>
                {!aiAnswer && !isAskingAi && (
                  <button
                    onClick={handleAskAI}
                    className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold"
                  >
                    Query Records
                  </button>
                )}
              </div>
              {isAskingAi && <p className="text-amber-700 mt-1">Retrieving recorded facts...</p>}
              {aiAnswer && (
                <p className="text-stone-900 font-medium mt-1 leading-relaxed">{aiAnswer}</p>
              )}
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4 divide-y divide-stone-100">
          {!query.trim() ? (
            <div className="space-y-4 text-xs text-stone-500 py-2">
              <div>
                <div className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] mb-2">
                  Sample Natural Language Queries
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'When did I buy my MacBook?',
                    'Who owes me the most?',
                    'How much did I spend on software?',
                    'Show my payments to John',
                    'Amazon',
                    'Emirates NBD',
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setQuery(sample)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts List */}
              <div className="pt-3 border-t border-stone-100">
                <div className="font-semibold text-stone-700 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Command className="w-3.5 h-3.5" />
                  Keyboard Shortcuts
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone-600">
                  <div className="flex items-center justify-between p-1.5 bg-stone-50 rounded">
                    <span>Search / Ask AI</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">
                      /
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-stone-50 rounded">
                    <span>New Transaction Input</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">
                      N
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-stone-50 rounded">
                    <span>Go to Ledgers</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">
                      G L
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-stone-50 rounded">
                    <span>Go to Journals</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">
                      G J
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-stone-50 rounded">
                    <span>Go to Trial Balance</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">
                      G T
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-stone-50 rounded">
                    <span>Go to Books</span>
                    <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded font-mono text-[10px]">
                      G B
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transactions matches */}
              {matchedTx.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Transactions ({matchedTx.length})
                  </div>
                  <div className="space-y-1">
                    {matchedTx.map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => {
                          onSelectTransaction(tx);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-stone-50 text-left flex items-center justify-between border border-transparent hover:border-stone-200 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-900">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {tx.date} • {tx.counterparty} • {tx.relevantBook}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-semibold text-stone-900">
                            {tx.currency} {tx.amount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-stone-400 uppercase">{tx.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* People matches */}
              {matchedPeople.length > 0 && (
                <div className="pt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    People & Organizations ({matchedPeople.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedPeople.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigateToTab('people');
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200 text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-stone-900">{p.name}</div>
                            <div className="text-[10px] text-stone-500 capitalize">{p.role}</div>
                          </div>
                        </div>
                        {p.theyOweYou > 0 && (
                          <div className="text-[11px] font-mono font-bold text-emerald-700">
                            +{p.theyOweYou}
                          </div>
                        )}
                        {p.youOweThem > 0 && (
                          <div className="text-[11px] font-mono font-bold text-amber-700">
                            -{p.youOweThem}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts matches */}
              {matchedAccounts.length > 0 && (
                <div className="pt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
                    Chart of Accounts ({matchedAccounts.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedAccounts.map((a) => (
                      <div
                        key={a.code}
                        className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono text-stone-400 text-[10px] mr-1.5">
                            {a.code}
                          </span>
                          <span className="font-medium text-stone-900">{a.name}</span>
                        </div>
                        <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                          {a.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedTx.length === 0 && matchedPeople.length === 0 && matchedAccounts.length === 0 && !aiAnswer && (
                <div className="text-center py-6 text-xs text-stone-400">
                  No direct records found for &ldquo;{query}&rdquo;. Press Enter to ask AI to analyze recorded facts.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
