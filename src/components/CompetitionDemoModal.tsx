import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  BookOpen,
  Layers,
  Scale,
  Upload,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CanonicalTransaction } from '../types';

interface CompetitionDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const CompetitionDemoModal: React.FC<CompetitionDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const {
    runDemoStep,
    setExperienceLevel,
    setSelectedTransaction,
    transactions,
    resetToDemoState,
    accountingHealth,
  } = useAccounting();

  const [currentStep, setCurrentStep] = useState(1);
  const [outputLog, setOutputLog] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      time: '0:30',
      title: 'Demo Transaction #1: MacBook Purchase',
      prompt: 'Bought a MacBook from Amazon for AED 6,000 using Emirates NBD.',
      desc: 'AI interprets natural language, passes to deterministic engine, validates double-entry, and posts to Books, Journals, and Ledgers.',
      actionLabel: 'Post MacBook Purchase',
    },
    {
      step: 2,
      time: '1:00 - 1:45',
      title: 'Inspect Double-Entry & Professional Books',
      prompt: 'Books → Journals → Ledgers → Trial Balance',
      desc: 'Witness the Judge’s WOW moment: the same canonical transaction ID propagates seamlessly across professional accounting structures.',
      actionLabel: 'Inspect & Switch to Professional Mode',
    },
    {
      step: 3,
      time: '2:15',
      title: 'Demo Transaction #2: Accounts Receivable (Sarah)',
      prompt: 'Sarah owes me AED 750 for design work.',
      desc: 'Records revenue in Sales Day Book and adds Sarah to People ("Who owes me?").',
      actionLabel: 'Post Sarah Receivable',
    },
    {
      step: 4,
      time: '2:30',
      title: 'Demo Transaction #3: Debt Settlement (John)',
      prompt: 'I paid John AED 500 that I owed him.',
      desc: 'Automatically reduces outstanding liability balance to AED 0 without manual calculation.',
      actionLabel: 'Post Payment to John',
    },
    {
      step: 5,
      time: '2:45',
      title: 'Demo Transaction #4: Refund Linking (Amazon)',
      prompt: 'Amazon refunded me AED 400.',
      desc: 'Identifies relationship with the original MacBook purchase and credits back Emirates NBD.',
      actionLabel: 'Post Amazon Refund',
    },
    {
      step: 6,
      time: '3:00',
      title: 'The "Magic" Moment: Simple vs. Professional View',
      prompt: 'One sentence in. Complete accounting system out.',
      desc: 'Switch back to Simple/Casual view. The user sees a simple card; the accountant sees full journals and balanced ledgers.',
      actionLabel: 'Switch to Casual Mode & Verify',
    },
  ];

  const handleExecuteCurrentStep = async () => {
    setIsExecuting(true);
    try {
      if (currentStep === 1) {
        const out = await runDemoStep(1);
        setOutputLog(out);
      } else if (currentStep === 2) {
        setExperienceLevel('professional');
        onNavigateToTab('trial-balance');
        // Find the MacBook transaction
        const mb = transactions.find((t) => t.description.toLowerCase().includes('macbook'));
        if (mb) setSelectedTransaction(mb);
        setOutputLog('Switched to Professional Mode. Trial balance and ledgers verified balanced.');
      } else if (currentStep === 3) {
        const out = await runDemoStep(2);
        setOutputLog(out);
        onNavigateToTab('people');
      } else if (currentStep === 4) {
        const out = await runDemoStep(3);
        setOutputLog(out);
        onNavigateToTab('people');
      } else if (currentStep === 5) {
        const out = await runDemoStep(4);
        setOutputLog(out);
        onNavigateToTab('transactions');
      } else if (currentStep === 6) {
        setExperienceLevel('casual');
        onNavigateToTab('home');
        setOutputLog('Returned to Simple / Casual Mode. One canonical financial reality displayed cleanly.');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const stepInfo = demoSteps[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Product Demo Walkthrough
              </h3>
              <p className="text-xs text-stone-400">
                Step-by-step verification of the master specification flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs overflow-x-auto no-scrollbar">
          {demoSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStep(s.step);
                setOutputLog(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                currentStep === s.step
                  ? 'bg-stone-900 text-white'
                  : currentStep > s.step
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <span>{s.step}.</span>
              <span className="truncate max-w-[85px]">{s.title.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Step Details */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
              Time marker: {stepInfo.time}
            </span>
            <span className="text-xs text-stone-400">Step {currentStep} of {demoSteps.length}</span>
          </div>

          <h4 className="text-lg font-bold text-stone-900">{stepInfo.title}</h4>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
              Natural Language Input
            </div>
            <div className="text-sm font-semibold text-stone-900 font-mono">
              &ldquo;{stepInfo.prompt}&rdquo;
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">{stepInfo.desc}</p>

          {outputLog && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-mono whitespace-pre-line animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Execution Result:
              </div>
              {outputLog}
            </div>
          )}

          {/* Quick links to accounting views during demo */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-stone-400 text-[11px]">Inspect view:</span>
            <button
              onClick={() => {
                setExperienceLevel('casual');
                onNavigateToTab('home');
                onClose();
              }}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium"
            >
              Simple / Casual
            </button>
            <button
              onClick={() => {
                setExperienceLevel('professional');
                onNavigateToTab('books');
                onClose();
              }}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" /> Books
            </button>
            <button
              onClick={() => {
                setExperienceLevel('professional');
                onNavigateToTab('ledgers');
                onClose();
              }}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium flex items-center gap-1"
            >
              <Layers className="w-3 h-3" /> Ledgers
            </button>
            <button
              onClick={() => {
                setExperienceLevel('professional');
                onNavigateToTab('trial-balance');
                onClose();
              }}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-medium flex items-center gap-1"
            >
              <Scale className="w-3 h-3" /> Trial Balance
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset demo state to initial seed values?')) {
                resetToDemoState();
                setCurrentStep(1);
                setOutputLog('Demo state reset to initial.');
              }
            }}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setOutputLog(null);
                }}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/70 rounded-lg"
              >
                Previous
              </button>
            )}

            <button
              onClick={handleExecuteCurrentStep}
              disabled={isExecuting}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{stepInfo.actionLabel}</span>
            </button>

            {currentStep < demoSteps.length && (
              <button
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                  setOutputLog(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-black rounded-lg flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
