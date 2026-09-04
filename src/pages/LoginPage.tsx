import React, { useState } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAccounting();
  const [username, setUsername] = useState('Jain');
  const [password, setPassword] = useState('MyAccount1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const u = customUser !== undefined ? customUser : username;
    const p = customPass !== undefined ? customPass : password;

    if (!u.trim()) {
      setError('Please enter a username');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      login(u, p);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-black font-bold text-xl mb-1 shadow-lg shadow-white/5">
            S
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            SimplyManage
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Accounting that speaks human. Choose an account to sign in.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Jain or your name"
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 font-mono transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 font-mono transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Options */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 text-center font-medium">
            Quick Preset Accounts
          </div>

          {/* Preset 1: Jain Demo */}
          <button
            type="button"
            onClick={() => handleLogin(undefined, 'Jain', 'MyAccount1234')}
            className="w-full text-left p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/60 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Jain (Full Demo State)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10">
                1-Click Sign In
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              User: <strong className="text-zinc-200">Jain</strong> | Pass: <strong className="text-zinc-200">MyAccount1234</strong>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Loads pre-populated transactions, invoices, counterparty debts, and reports.
            </p>
          </button>

          {/* Preset 2: Clean Custom Account */}
          <button
            type="button"
            onClick={() => handleLogin(undefined, 'NewFounder', 'setup123')}
            className="w-full text-left p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Fresh Organization (Setup Wizard)
              </span>
              <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 rounded-full bg-blue-500/10">
                Clean State
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Any custom username and password
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Initializes an empty ledger and launches the Entity Setup Page.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
