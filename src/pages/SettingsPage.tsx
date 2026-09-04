import React, { useState } from 'react';
import { Settings, Globe, Shield, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { ExperienceLevel } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    activeEntity,
    experienceLevel,
    setExperienceLevel,
    accounts,
  } = useAccounting();

  const [saved, setSaved] = useState(false);
  const [currency, setCurrency] = useState(activeEntity.baseCurrency);
  const [fiscalMonth, setFiscalMonth] = useState('January');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    activeEntity.baseCurrency = currency;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
          Preferences & Chart Configuration
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Configure accounting rules, currency standards, fiscal calendars, and default UI density.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Settings Sections */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Experience Level Switcher */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Experience Mode</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Choose how SimplyManage surfaces accounting concepts and terminology.
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-emerald-400">
              Active: {experienceLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {(
              [
                {
                  id: 'casual',
                  title: 'Casual Mode',
                  desc: 'Simplified vocabulary. Hides debit/credit columns behind human cards ("You owe", "You are owed").',
                },
                {
                  id: 'management',
                  title: 'Management Mode',
                  desc: 'Business operational views: Cash flow, P&L, customer balances, invoices, and expense trends.',
                },
                {
                  id: 'professional',
                  title: 'Professional Mode',
                  desc: 'Full traditional accounting: General Journal, Books of Prime Entry, T-Account Ledgers, and Trial Balance.',
                },
              ] as const
            ).map((mode) => {
              const isSelected = experienceLevel === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setExperienceLevel(mode.id as ExperienceLevel)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-zinc-950/80 hover:border-zinc-700 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs font-mono">{mode.title}</div>
                  <p
                    className={`text-[11px] mt-1.5 leading-relaxed ${
                      isSelected ? 'text-zinc-700 font-medium' : 'text-zinc-500'
                    }`}
                  >
                    {mode.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency & Fiscal Year */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Currency & Regional Standards</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-currency support with native conversion and base reporting currency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                Base Operating Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="AED">AED — United Arab Emirates Dirham</option>
                <option value="USD">USD — United States Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="INR">INR — Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                Fiscal Year Start Month
              </label>
              <select
                value={fiscalMonth}
                onChange={(e) => setFiscalMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="January">January (Calendar Year)</option>
                <option value="April">April (UK / Commonwealth Standard)</option>
                <option value="July">July (Australian Standard)</option>
                <option value="October">October (US Federal Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart of Accounts Summary */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Active Chart of Accounts</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Standard 4-digit accounting structure</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{accounts.length} accounts configured</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pt-1 font-mono">
            {accounts.map((acc) => (
              <div
                key={acc.code}
                className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-zinc-500 mr-2">{acc.code}</span>
                  <span className="font-sans font-medium text-white">{acc.name}</span>
                </div>
                <span className="text-[10px] uppercase text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                  {acc.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl transition-colors"
          >
            SAVE PREFERENCES
          </button>
        </div>
      </form>
    </div>
  );
};
