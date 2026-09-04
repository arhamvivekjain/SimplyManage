import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  HelpCircle,
  Landmark,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

interface SetupPageProps {
  onComplete?: () => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({ onComplete }) => {
  const { activeEntity, completeOrganizationSetup, currentUser } = useAccounting();

  const [entityName, setEntityName] = useState(activeEntity.name || 'My New Business');
  const [entityType, setEntityType] = useState<'personal' | 'business' | 'client'>('business');
  const [legalStructure, setLegalStructure] = useState('LLC / Private Limited');
  const [baseCurrency, setBaseCurrency] = useState(activeEntity.baseCurrency || 'USD');
  const [fiscalYearStart, setFiscalYearStart] = useState('01-01');
  const [taxNumber, setTaxNumber] = useState('');
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [initialBankName, setInitialBankName] = useState('Primary Operating Account');
  const [initialBankBalance, setInitialBankBalance] = useState<number>(5000);
  const [accountingMethod, setAccountingMethod] = useState<'accrual' | 'cash'>('accrual');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currencyOptions = [
    { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (AED)' },
    { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
    { code: 'CAD', symbol: '$', label: 'Canadian Dollar (CAD)' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
    { code: 'AUD', symbol: '$', label: 'Australian Dollar (AUD)' },
    { code: 'SGD', symbol: '$', label: 'Singapore Dollar (SGD)' },
  ];

  const handleSaveSetup = (e: React.FormEvent) => {
    e.preventDefault();

    completeOrganizationSetup({
      entityName: entityName.trim() || 'My Business',
      entityType,
      baseCurrency,
      fiscalYearStart,
      taxNumber: taxNumber.trim() || undefined,
      initialBankBalance: initialBankBalance > 0 ? initialBankBalance : undefined,
      initialBankName: initialBankName.trim() || 'Primary Operating Account',
    });

    setIsSubmitted(true);
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Entity Onboarding
          </span>
          {currentUser?.setupCompleted && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Configured
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Organization Setup
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
          Configure your operating entity, reporting currency, fiscal calendar, and initial opening balance.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-8 bg-zinc-900/90 border border-emerald-500/40 rounded-3xl text-center space-y-4 max-w-xl mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Setup Successfully Initialized!</h2>
          <p className="text-xs text-zinc-400 font-mono">
            {entityName} is now configured with base currency <strong className="text-white">{baseCurrency}</strong>.
            {initialBankBalance > 0 && ` Opening balance of ${baseCurrency} ${initialBankBalance.toLocaleString()} posted to ${initialBankName}.`}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onComplete && onComplete()}
              className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-zinc-200 transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveSetup} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Legal Profile */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">1. Entity Profile</h2>
                  <p className="text-[11px] text-zinc-500 font-mono">Identity & Legal Structure</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Organization / Legal Name</label>
                <input
                  type="text"
                  required
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. Apex Technologies LLC"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Account Context</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntityType('business')}
                    className={`py-2 px-3 text-xs font-mono rounded-xl border transition-all ${
                      entityType === 'business'
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    Business / Co
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityType('personal')}
                    className={`py-2 px-3 text-xs font-mono rounded-xl border transition-all ${
                      entityType === 'personal'
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    Personal / Solo
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Legal Structure</label>
                <select
                  value={legalStructure}
                  onChange={(e) => setLegalStructure(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                >
                  <option value="LLC / Private Limited">LLC / Private Limited</option>
                  <option value="Sole Proprietor / Freelancer">Sole Proprietor / Freelancer</option>
                  <option value="Corporation / Public Ltd">Corporation / Public Ltd</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Non-Profit / Foundation">Non-Profit / Foundation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Tax / VAT Registration No.</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="e.g. VAT-100293847 (Optional)"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Country / Jurisdiction</label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="e.g. United States, UAE, UK, India"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Step 2: Currency & Calendar */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">2. Currency & Calendar</h2>
                  <p className="text-[11px] text-zinc-500 font-mono">Fiscal Baseline</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Base Reporting Currency</label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500 font-mono">
                  All ledger records, reports, and invoices will convert and report in this currency.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Fiscal Year Start</label>
                <select
                  value={fiscalYearStart}
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                >
                  <option value="01-01">January 1st (Calendar Year)</option>
                  <option value="04-01">April 1st (UK / India / Japan)</option>
                  <option value="07-01">July 1st (Australia / New Zealand)</option>
                  <option value="10-01">October 1st (US Federal fiscal)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Accounting Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountingMethod('accrual')}
                    className={`py-2 px-3 text-xs font-mono rounded-xl border transition-all text-left ${
                      accountingMethod === 'accrual'
                        ? 'bg-zinc-800 text-white font-bold border-zinc-600'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-white">Accrual Basis</div>
                    <div className="text-[10px] text-zinc-400">Standard / GAAP</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountingMethod('cash')}
                    className={`py-2 px-3 text-xs font-mono rounded-xl border transition-all text-left ${
                      accountingMethod === 'cash'
                        ? 'bg-zinc-800 text-white font-bold border-zinc-600'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-white">Cash Basis</div>
                    <div className="text-[10px] text-zinc-400">Simple Cash In/Out</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Bank & Opening Balance */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">3. Bank & Opening Balance</h2>
                  <p className="text-[11px] text-zinc-500 font-mono">Starter Capital</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">Primary Bank Account Name</label>
                <input
                  type="text"
                  value={initialBankName}
                  onChange={(e) => setInitialBankName(e.target.value)}
                  placeholder="e.g. Chase Business or Emirates NBD"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 font-medium">
                  Opening Cash Balance ({baseCurrency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={initialBankBalance}
                  onChange={(e) => setInitialBankBalance(Number(e.target.value) || 0)}
                  placeholder="5000"
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-zinc-500"
                />
                <p className="text-[10px] text-zinc-500 font-mono">
                  Automatically credits <strong>3010 Owner Capital</strong> and debits <strong>1020 {initialBankName}</strong>.
                </p>
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  First Entry Ready
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  Once saved, you can immediately speak or type natural transactions like:
                  <em className="text-white block mt-0.5">"Paid 120 for domain name via card"</em>
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg active:scale-[0.99]"
            >
              <span>Save & Complete Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
