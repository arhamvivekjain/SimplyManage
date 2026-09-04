import React, { useState } from 'react';
import { Building2, Plus, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Entity } from '../types';

export const ClientsPage: React.FC = () => {
  const { entities, activeEntity, switchEntity } = useAccounting();

  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState<'business' | 'personal' | 'client'>('business');
  const [newEntityCurrency, setNewEntityCurrency] = useState('AED');
  const [createdMsg, setCreatedMsg] = useState<string | null>(null);

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    // Add entity (in real app, or via mock)
    const newEnt: Entity = {
      id: `ent-${Date.now()}`,
      name: newEntityName.trim(),
      type: newEntityType,
      icon: 'Building2',
      baseCurrency: newEntityCurrency,
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
    };

    entities.push(newEnt);
    switchEntity(newEnt.id);
    setCreatedMsg(`Entity "${newEnt.name}" created and activated with isolated data scope.`);
    setNewEntityName('');
    setTimeout(() => setCreatedMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
          Tenant Isolation
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Multi-Client & Entity Management
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Strict data boundary enforcement. Manage multiple clients or distinct companies without cross-contamination.
        </p>
      </div>

      {createdMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{createdMsg}</span>
        </div>
      )}

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entities.map((entity) => {
          const isActive = entity.id === activeEntity.id;
          return (
            <div
              key={entity.id}
              className={`p-5 rounded-3xl border transition-all ${
                isActive
                  ? 'bg-zinc-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                      isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white leading-tight">{entity.name}</h3>
                    <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block uppercase">
                      {entity.type} • Base: {entity.baseCurrency}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-mono flex items-center justify-between">
                <span className="text-zinc-500">Fiscal Year: Jan 1</span>
                {!isActive ? (
                  <button
                    onClick={() => switchEntity(entity.id)}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
                  >
                    <span>Switch</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                ) : (
                  <span className="text-emerald-400 font-medium">Selected</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Entity Card */}
      <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-5 sm:p-6">
        <h3 className="text-base font-bold text-white mb-1">Add New Client or Company</h3>
        <p className="text-xs text-zinc-400 font-mono mb-4">
          Creates a completely isolated chart of accounts and transaction ledger.
        </p>

        <form onSubmit={handleCreateEntity} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              placeholder="Company or client name (e.g. Zenith Media FZE)"
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/80"
              required
            />
          </div>

          <div>
            <select
              value={newEntityType}
              onChange={(e) => setNewEntityType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-300 focus:outline-none focus:border-emerald-500/80"
            >
              <option value="business">Business / Corporate</option>
              <option value="personal">Individual / Freelancer</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-xs font-mono font-medium bg-white hover:bg-zinc-200 text-black rounded-2xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Entity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
