import React, { useState, useEffect } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PeoplePage } from './pages/PeoplePage';
import { InvoicesPage } from './pages/InvoicesPage';
import { BooksPage } from './pages/BooksPage';
import { JournalsPage } from './pages/JournalsPage';
import { LedgersPage } from './pages/LedgersPage';
import { TrialBalancePage } from './pages/TrialBalancePage';
import { ReportsPage } from './pages/ReportsPage';
import { ClientsPage } from './pages/ClientsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { MoneyPage } from './pages/MoneyPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { SetupPage } from './pages/SetupPage';
import { LoginPage } from './pages/LoginPage';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { CompetitionDemoModal } from './components/CompetitionDemoModal';
import { SearchAndShortcutsModal } from './components/SearchAndShortcutsModal';
import { InvoiceAndReceiptModal } from './components/InvoiceAndReceiptModal';
import { CanonicalTransaction } from './types';

function AccountingAppContent() {
  const { currentUser } = useAccounting();
  const [activeTab, setActiveTab] = useState<string>(() => {
    // If user is fresh with setup incomplete, open setup directly
    return currentUser && !currentUser.setupCompleted && !currentUser.isDemo
      ? 'setup'
      : 'home';
  });
  const [inspectingTx, setInspectingTx] = useState<CanonicalTransaction | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [invoiceModalState, setInvoiceModalState] = useState<{
    isOpen: boolean;
    mode: 'create-invoice' | 'scan-receipt';
  }>({ isOpen: false, mode: 'create-invoice' });

  // If user is logged out, show Login page directly
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
        <LoginPage onSuccess={() => setActiveTab('home')} />
      </div>
    );
  }

  // Keyboard Shortcuts Listener
  useEffect(() => {
    let lastKey = '';
    let keyTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // '/' opens search
      if (e.key === '/') {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }

      // 'N' focuses or triggers new transaction input
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const inputEl = document.querySelector('textarea, input[type="text"]') as HTMLElement;
        if (inputEl) inputEl.focus();
        return;
      }

      // 'G' sequence shortcuts: 'g' then 'l' = ledgers, etc.
      if (lastKey === 'g' || lastKey === 'G') {
        if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          setActiveTab('ledgers');
        } else if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          setActiveTab('journals');
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          setActiveTab('trial-balance');
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setActiveTab('books');
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          setActiveTab('home');
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setActiveTab('people');
        }
        lastKey = '';
        return;
      }

      lastKey = e.key;
      if (keyTimeout) clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => {
        lastKey = '';
      }, 700);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyTimeout) clearTimeout(keyTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Primary Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        currentTab={activeTab}
        onTabChange={setActiveTab}
        setCurrentTab={setActiveTab}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenDemo={() => setDemoModalOpen(true)}
        onOpenCompetitionDemo={() => setDemoModalOpen(true)}
        onOpenShortcuts={() => setSearchModalOpen(true)}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        {(activeTab === 'home' || activeTab === 'dashboard') && (
          <HomePage
            onInspectTransaction={(tx) => setInspectingTx(tx)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenCreateInvoice={() =>
              setInvoiceModalState({ isOpen: true, mode: 'create-invoice' })
            }
            onOpenScanReceipt={() =>
              setInvoiceModalState({ isOpen: true, mode: 'scan-receipt' })
            }
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsPage onInspectTransaction={(tx) => setInspectingTx(tx)} />
        )}

        {activeTab === 'people' && <PeoplePage />}

        {activeTab === 'invoices' && (
          <InvoicesPage
            onOpenCreateInvoice={() =>
              setInvoiceModalState({ isOpen: true, mode: 'create-invoice' })
            }
            onOpenScanReceipt={() =>
              setInvoiceModalState({ isOpen: true, mode: 'scan-receipt' })
            }
          />
        )}

        {activeTab === 'money' && (
          <MoneyPage onInspectTransaction={(tx) => setInspectingTx(tx)} />
        )}

        {activeTab === 'organization' && <OrganizationPage />}

        {activeTab === 'books' && (
          <BooksPage onInspectTransaction={(tx) => setInspectingTx(tx)} />
        )}

        {activeTab === 'journals' && (
          <JournalsPage onInspectTransaction={(tx) => setInspectingTx(tx)} />
        )}

        {activeTab === 'ledgers' && (
          <LedgersPage onInspectTransaction={(tx) => setInspectingTx(tx)} />
        )}

        {activeTab === 'trial-balance' && <TrialBalancePage />}

        {activeTab === 'reports' && <ReportsPage />}

        {activeTab === 'clients' && <ClientsPage />}

        {(activeTab === 'audit' || activeTab === 'audit-log') && <AuditLogPage />}

        {activeTab === 'setup' && (
          <SetupPage onComplete={() => setActiveTab('home')} />
        )}

        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Footer Notice */}
      <footer className="py-4 border-t border-zinc-800/80 text-center text-xs text-zinc-500 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-zinc-400">SimplyManage</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500">The accounting system that speaks human.</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Deterministic Invariant: &Sigma; Debits &equiv; &Sigma; Credits • Press <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 font-mono text-[10px]">/</kbd> to search
          </span>
        </div>
      </footer>

      {/* Modals */}
      <TransactionDetailModal
        transaction={inspectingTx}
        onClose={() => setInspectingTx(null)}
      />

      <CompetitionDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />

      <SearchAndShortcutsModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTransaction={(tx) => setInspectingTx(tx)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      <InvoiceAndReceiptModal
        isOpen={invoiceModalState.isOpen}
        initialMode={invoiceModalState.mode}
        onClose={() =>
          setInvoiceModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <AccountingProvider>
      <AccountingAppContent />
    </AccountingProvider>
  );
}
