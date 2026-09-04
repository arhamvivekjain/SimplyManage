import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  User,
  Sparkles,
  Search,
  Command,
  HelpCircle,
  Briefcase,
  ChevronDown,
  Play,
  RotateCcw,
  CheckCircle2,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { ExperienceLevel, ProfileContext } from '../types';

interface NavbarProps {
  onOpenDemo?: () => void;
  onOpenCompetitionDemo?: () => void;
  onOpenShortcuts?: () => void;
  onOpenSearch?: () => void;
  onOpenLogin?: () => void;
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  onOpenCompetitionDemo,
  onOpenShortcuts,
  onOpenSearch,
  onOpenLogin,
  currentTab,
  activeTab,
  setCurrentTab,
  onTabChange,
}) => {
  const selectedTab = currentTab || activeTab || 'home';
  const handleTabSelect = (tab: string) => {
    if (setCurrentTab) setCurrentTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const handleDemo = onOpenDemo || onOpenCompetitionDemo || (() => {});
  const handleSearch = onOpenSearch || (() => {});
  const handleShortcuts = onOpenShortcuts || onOpenSearch || (() => {});
  const {
    currentUser,
    logout,
    login,
    experienceLevel,
    setExperienceLevel,
    entities,
    activeEntity,
    setActiveEntityId,
    accountingHealth,
    resetToDemoState,
  } = useAccounting();

  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  // Tab definitions based on Experience Level
  const tabs = React.useMemo(() => {
    const list: Array<{ id: string; label: string }> = [];

    if (experienceLevel === 'casual') {
      list.push(
        { id: 'home', label: 'Home' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'people', label: 'People' },
        { id: 'reports', label: 'Reports' },
        { id: 'settings', label: 'Settings' }
      );
    } else if (experienceLevel === 'management') {
      list.push(
        { id: 'home', label: 'Home' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'people', label: 'People' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'money', label: 'Money' },
        { id: 'reports', label: 'Reports' },
        { id: 'organization', label: 'Organization' },
        { id: 'settings', label: 'Settings' }
      );
    } else {
      // Professional Mode
      list.push(
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'books', label: 'Books' },
        { id: 'journals', label: 'Journals' },
        { id: 'ledgers', label: 'Ledgers' },
        { id: 'trial-balance', label: 'Trial Balance' },
        { id: 'reports', label: 'Reports' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'people', label: 'People' },
        { id: 'clients', label: 'Clients' },
        { id: 'audit-log', label: 'Audit Log' },
        { id: 'settings', label: 'Settings' }
      );
    }

    // Include Setup tab prominently for fresh/non-demo accounts or when setup pending
    if (!currentUser?.setupCompleted || !currentUser?.isDemo) {
      list.splice(1, 0, { id: 'setup', label: 'Setup' });
    } else {
      list.push({ id: 'setup', label: 'Setup' });
    }

    return list;
  }, [experienceLevel, currentUser]);

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 shrink-0">
      {/* Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 shrink-0 gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleTabSelect(experienceLevel === 'professional' ? 'dashboard' : 'home')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
            >
              <img
                src="/icon.png"
                alt="SimplyManage"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-sm border border-zinc-800/80 group-hover:border-emerald-500/50 transition-all shrink-0"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-bold text-white text-sm sm:text-base tracking-tight leading-none">Simply</span>
                  <span className="font-bold text-emerald-400 text-sm sm:text-base tracking-tight leading-none">Manage</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-1 hidden sm:block">
                  speaks human
                </span>
              </div>
            </button>

            {/* Health Indicator Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-zinc-300">
              <div
                className={`w-2 h-2 rounded-full ${
                  accountingHealth.isBalanced ? 'bg-emerald-500' : 'bg-amber-500'
                } animate-pulse`}
              />
              <span>
                {accountingHealth.isBalanced ? 'Balanced' : 'Imbalance Detected'}
              </span>
            </div>
          </div>

          {/* Center Search / Natural Language Trigger */}
          <div className="flex-1 max-w-sm mx-2 hidden md:block">
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 rounded-xl border border-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">Search transactions, people, accounts...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-500 shrink-0">
                <Command className="w-2.5 h-2.5" /> /
              </kbd>
            </button>
          </div>

          {/* Right Controls: Entity Switcher, Mode, User Profile, Demo */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Entity Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setEntityDropdownOpen(!entityDropdownOpen);
                  setUserDropdownOpen(false);
                  setModeDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors"
                title="Switch Financial Entity"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[70px] sm:max-w-[110px] truncate">{activeEntity.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
              </button>

              {entityDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                    Switch Entity
                  </div>
                  {entities.map((ent) => (
                    <button
                      key={ent.id}
                      onClick={() => {
                        setActiveEntityId(ent.id);
                        setEntityDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-zinc-900/80 transition-colors ${
                        activeEntity.id === ent.id
                          ? 'font-semibold text-emerald-400 bg-emerald-500/10'
                          : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>
                          {ent.type === 'personal' ? '👤' : ent.type === 'business' ? '🏢' : '📋'}
                        </span>
                        <span className="truncate">{ent.name}</span>
                      </div>
                      {activeEntity.id === ent.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Level Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setModeDropdownOpen(!modeDropdownOpen);
                  setEntityDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors"
                title="Switch Experience Level"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="capitalize hidden sm:inline">{experienceLevel}</span>
                <span className="capitalize sm:hidden text-[11px]">{experienceLevel.slice(0, 4)}..</span>
                <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
              </button>

              {modeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                    Experience Mode
                  </div>
                  {(['casual', 'management', 'professional'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setExperienceLevel(lvl);
                        if (lvl === 'professional' && selectedTab === 'home') {
                          handleTabSelect('dashboard');
                        } else if (lvl !== 'professional' && selectedTab === 'dashboard') {
                          handleTabSelect('home');
                        }
                        setModeDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-zinc-900 text-xs transition-colors ${
                        experienceLevel === lvl ? 'bg-zinc-900 font-medium' : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-semibold text-white">{lvl} Mode</span>
                        {experienceLevel === lvl && (
                          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {lvl === 'casual' && 'For individuals. Speaks human, minimizes accounting terms.'}
                        {lvl === 'management' && 'For freelancers & creators. More tools, invoices & money.'}
                        {lvl === 'professional' && 'Full traditional accounting: General Journal, Books of Prime Entry, T-Account Ledgers & Trial Balance.'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Profile Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setEntityDropdownOpen(false);
                  setModeDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors"
                title="User Account"
              >
                <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="max-w-[50px] sm:max-w-[80px] truncate">{currentUser?.username || 'Sign In'}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <div className="text-xs font-bold text-white">
                      {currentUser?.username || 'Guest'}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      {currentUser?.isDemo ? 'Jain Demo Account' : 'Custom Organization Account'}
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        login('Jain', 'MyAccount1234');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-mono text-zinc-300 hover:bg-zinc-900 rounded-xl flex items-center justify-between"
                    >
                      <span>Sign in as Jain</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Demo Data</span>
                    </button>

                    <button
                      onClick={() => {
                        login('Founder', 'pass123');
                        setUserDropdownOpen(false);
                        handleTabSelect('setup');
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-mono text-zinc-300 hover:bg-zinc-900 rounded-xl flex items-center justify-between"
                    >
                      <span>New Organization</span>
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Setup</span>
                    </button>

                    <div className="border-t border-zinc-800/80 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-mono text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch User / Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Competition Demo Walkthrough Button */}
            <button
              onClick={handleDemo}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-sm transition-colors whitespace-nowrap shrink-0"
              title="Run Product Demo Flow"
            >
              <Play className="w-3 h-3 fill-black shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs">DEMO</span>
            </button>

            {/* Reset to Seed Data */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo records back to initial clean state?')) {
                  resetToDemoState();
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors shrink-0"
              title="Reset data to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Shortcuts trigger */}
            <button
              onClick={handleShortcuts}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors hidden sm:inline-flex shrink-0"
              title="Keyboard shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Stable height (h-12 min-h-[48px]) to prevent twitching */}
        <nav className="flex items-center gap-1 sm:gap-1.5 h-12 min-h-[48px] shrink-0 overflow-x-auto no-scrollbar border-t border-zinc-800/60 scroll-smooth">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`px-3.5 py-1.5 text-xs rounded-xl whitespace-nowrap transition-all font-medium shrink-0 ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

