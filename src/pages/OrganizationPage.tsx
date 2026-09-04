import React, { useState } from 'react';
import {
  Building2,
  Users,
  Plus,
  Layers,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle2,
  FolderKanban,
  User,
  X,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Entity, AccountType } from '../types';

export const OrganizationPage: React.FC = () => {
  const {
    entities,
    activeEntity,
    setActiveEntityId,
    addEntity,
    accounts,
    people,
    invoices,
  } = useAccounting();

  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState<'personal' | 'business' | 'client'>('business');
  const [newEntityCurrency, setNewEntityCurrency] = useState(activeEntity.baseCurrency || 'AED');

  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    const newId = `entity-${Date.now()}`;
    const created: Entity = {
      id: newId,
      name: newEntityName.trim(),
      type: newEntityType,
      icon: newEntityType === 'personal' ? 'User' : newEntityType === 'client' ? 'FolderKanban' : 'Building2',
      baseCurrency: newEntityCurrency,
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
    };

    addEntity(created);
    setShowAddEntityModal(false);
    setNewEntityName('');
  };

  const accountCategories: Array<{ type: AccountType; label: string; codeRange: string; color: string }> = [
    { type: 'asset', label: 'Assets', codeRange: '1000 - 1999', color: 'text-emerald-400' },
    { type: 'liability', label: 'Liabilities', codeRange: '2000 - 2999', color: 'text-rose-400' },
    { type: 'equity', label: 'Equity & Capital', codeRange: '3000 - 3999', color: 'text-purple-400' },
    { type: 'income', label: 'Revenue / Income', codeRange: '4000 - 4999', color: 'text-blue-400' },
    { type: 'expense', label: 'Operating Expenses', codeRange: '5000 - 5999', color: 'text-amber-400' },
  ];

  const filteredAccounts =
    selectedAccountType === 'all'
      ? accounts
      : accounts.filter((a) => a.type === selectedAccountType);

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Corporate Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Organization & Chart of Accounts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-0.5">
            Multi-entity architecture, legal entities, and account master structure.
          </p>
        </div>

        <button
          onClick={() => setShowAddEntityModal(true)}
          className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Entity</span>
        </button>
      </div>

      {/* Multi-Entity Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Configured Entities & Tenants ({entities.length})
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            Active: <strong className="text-emerald-400">{activeEntity.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => {
            const isActive = entity.id === activeEntity.id;
            return (
              <div
                key={entity.id}
                onClick={() => setActiveEntityId(entity.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                  isActive
                    ? 'bg-zinc-900 border-white/40 ring-1 ring-white/20 shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        isActive ? 'bg-white text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {entity.type === 'personal' ? (
                        <User className="w-4 h-4" />
                      ) : entity.type === 'client' ? (
                        <FolderKanban className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">{entity.name}</div>
                      <div className="text-[11px] font-mono text-zinc-400 capitalize">{entity.type}</div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CURRENCY</span>
                    <span className="text-zinc-200 font-bold">{entity.baseCurrency}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">FISCAL START</span>
                    <span className="text-zinc-200">{entity.fiscalYearStart || '01-01'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Counterparty Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-blue-400" />
              Connected People & Counterparties
            </span>
            <span className="text-white font-bold">{people.length}</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            {people.filter((p) => p.role === 'customer').length} customers,{' '}
            {people.filter((p) => p.role === 'supplier').length} suppliers,{' '}
            {people.filter((p) => p.role === 'friend' || p.role === 'client').length} others.
          </p>
        </div>

        <div className="p-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-emerald-400" />
              Total Chart of Accounts
            </span>
            <span className="text-white font-bold">{accounts.length} codes</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Full canonical double-entry chart across 5 standard categories.
          </p>
        </div>
      </div>

      {/* Chart of Accounts Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Master Chart of Accounts
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Structured ledger accounts for {activeEntity.name}
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedAccountType('all')}
              className={`px-3 py-1 text-xs font-mono rounded-xl transition-colors whitespace-nowrap ${
                selectedAccountType === 'all'
                  ? 'bg-white text-black font-bold'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              All ({accounts.length})
            </button>
            {accountCategories.map((c) => (
              <button
                key={c.type}
                onClick={() => setSelectedAccountType(c.type)}
                className={`px-3 py-1 text-xs font-mono rounded-xl transition-colors whitespace-nowrap ${
                  selectedAccountType === c.type
                    ? 'bg-white text-black font-bold'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 text-zinc-400 font-mono font-medium border-b border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Balance ({activeEntity.baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredAccounts.map((a) => (
                <tr key={a.code} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-emerald-400">{a.code}</td>
                  <td className="py-3 px-4 font-sans font-medium text-white">{a.name}</td>
                  <td className="py-3 px-4 uppercase text-[10px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      {a.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-zinc-400 text-xs">{a.description}</td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {a.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (md:hidden) */}
        <div className="block md:hidden divide-y divide-zinc-800/60 font-mono space-y-2.5">
          {filteredAccounts.map((a) => (
            <div key={a.code} className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{a.code}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {a.type}
                </span>
              </div>
              <div className="font-sans font-medium text-white text-sm">{a.name}</div>
              <div className="text-[11px] text-zinc-400 font-sans">{a.description}</div>
              <div className="pt-1 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Balance:</span>
                <span className="font-bold text-white">
                  {activeEntity.baseCurrency} {a.balance.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Entity Modal */}
      {showAddEntityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Create New Entity</h3>
              </div>
              <button
                onClick={() => setShowAddEntityModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntity} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Entity Name</label>
                <input
                  type="text"
                  required
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  placeholder="e.g. Venture Labs LLC"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Entity Type</label>
                <select
                  value={newEntityType}
                  onChange={(e) => setNewEntityType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="business">Business / Corporation</option>
                  <option value="personal">Personal / Individual</option>
                  <option value="client">Client Project / Subsidiary</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Base Currency</label>
                <input
                  type="text"
                  required
                  value={newEntityCurrency}
                  onChange={(e) => setNewEntityCurrency(e.target.value.toUpperCase())}
                  placeholder="USD, AED, EUR, GBP"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEntityModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  Create Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
