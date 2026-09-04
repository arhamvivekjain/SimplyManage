import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Person, CanonicalTransaction } from '../types';

export const PeoplePage: React.FC = () => {
  const { people, transactions, activeEntity, postCanonicalTransaction } = useAccounting();

  const [selectedPerson, setSelectedPerson] = useState<Person>(people[0] || null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDirection, setPaymentDirection] = useState<'received' | 'paid'>('received');

  // Related transactions for selected person
  const personTransactions = transactions.filter(
    (t) =>
      selectedPerson &&
      (t.counterparty.toLowerCase().includes(selectedPerson.name.toLowerCase()) ||
        t.description.toLowerCase().includes(selectedPerson.name.toLowerCase()))
  );

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (paymentDirection === 'received') {
      // Customer paid us (e.g. Sarah pays AED 250)
      postCanonicalTransaction({
        originalInput: `${selectedPerson.name} paid ${activeEntity.baseCurrency} ${amt}`,
        description: `Payment from ${selectedPerson.name}`,
        amount: amt,
        currency: selectedPerson.currency || activeEntity.baseCurrency,
        counterparty: selectedPerson.name,
        counterpartyRole: 'customer',
        paymentMethod: 'Emirates NBD',
        transactionType: 'income',
        journalLines: [
          { accountCode: '1020', accountName: 'Emirates NBD', debit: amt, credit: 0 },
          { accountCode: '1030', accountName: 'Accounts Receivable', debit: 0, credit: amt },
        ],
        relevantBook: 'Cash Book',
        explanation: `Payment from ${selectedPerson.name} reduces outstanding receivable balance.`,
      });
    } else {
      // We paid supplier/creditor (e.g. Paid John AED 500)
      postCanonicalTransaction({
        originalInput: `Paid ${selectedPerson.name} ${activeEntity.baseCurrency} ${amt}`,
        description: `Payment to ${selectedPerson.name}`,
        amount: amt,
        currency: selectedPerson.currency || activeEntity.baseCurrency,
        counterparty: selectedPerson.name,
        counterpartyRole: 'supplier',
        paymentMethod: 'Emirates NBD',
        transactionType: 'payable',
        journalLines: [
          { accountCode: '2010', accountName: 'Accounts Payable', debit: amt, credit: 0 },
          { accountCode: '1020', accountName: 'Emirates NBD', debit: 0, credit: amt },
        ],
        relevantBook: 'Cash Book',
        explanation: `Payment reduces outstanding debt owed to ${selectedPerson.name}.`,
      });
    }

    setPaymentModalOpen(false);
    setPaymentAmount('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
          Counterparty & Relationship Graph
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">People</h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          First-class relationship database. Track who owes you and who you owe with automated balance calculation.
        </p>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: People List */}
        <div className="md:col-span-1 space-y-2">
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest px-1">
            All Contacts ({people.length})
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl divide-y divide-zinc-800/60 overflow-hidden">
            {people.map((person) => {
              const isSelected = selectedPerson?.id === person.id;
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className={`w-full p-4 text-left flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-zinc-800/90 border-l-2 border-emerald-400' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-200 flex items-center justify-center font-mono font-bold text-xs">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{person.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono capitalize mt-0.5">{person.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {person.theyOweYou > 0 && (
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        +{person.currency} {person.theyOweYou.toLocaleString()}
                      </div>
                    )}
                    {person.youOweThem > 0 && (
                      <div className="text-xs font-mono font-bold text-amber-400">
                        -{person.currency} {person.youOweThem.toLocaleString()}
                      </div>
                    )}
                    {person.theyOweYou === 0 && person.youOweThem === 0 && (
                      <div className="text-[11px] font-mono text-zinc-500">Settled (0)</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Relationship Detail & Timeline */}
        <div className="md:col-span-2 space-y-4">
          {selectedPerson ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-mono font-bold text-lg shadow-sm">
                    {selectedPerson.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{selectedPerson.name}</h3>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                        {selectedPerson.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mt-1">
                      {selectedPerson.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" /> {selectedPerson.email}
                        </span>
                      )}
                      {selectedPerson.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" /> {selectedPerson.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Payment Action */}
                <div>
                  <button
                    onClick={() => {
                      setPaymentDirection(selectedPerson.theyOweYou > 0 ? 'received' : 'paid');
                      setPaymentAmount(
                        selectedPerson.theyOweYou > 0
                          ? selectedPerson.theyOweYou.toString()
                          : selectedPerson.youOweThem > 0
                          ? selectedPerson.youOweThem.toString()
                          : ''
                      );
                      setPaymentModalOpen(true);
                    }}
                    className="px-3.5 py-2 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>RECORD SETTLEMENT</span>
                  </button>
                </div>
              </div>

              {/* Outstanding Balance Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">They Owe You (Receivable)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {selectedPerson.currency} {selectedPerson.theyOweYou.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">You Owe Them (Payable)</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {selectedPerson.currency} {selectedPerson.youOweThem.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Relationship Timeline */}
              <div>
                <h4 className="text-xs font-mono font-medium uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Transaction Timeline & History
                </h4>

                <div className="space-y-3">
                  {personTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-300">
                          {tx.transactionType === 'income' ? '+' : '-'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{tx.description}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            {tx.date} • {tx.paymentMethod} • {tx.relevantBook}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">
                          {tx.currency} {tx.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">{tx.status}</div>
                      </div>
                    </div>
                  ))}

                  {personTransactions.length === 0 && (
                    <div className="text-xs text-zinc-500 font-mono italic py-6 text-center border border-dashed border-zinc-800 rounded-2xl">
                      No transactions recorded with {selectedPerson.name} yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs bg-zinc-900/40 rounded-3xl border border-zinc-800">
              Select a person to view relationship history.
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-4 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-mono">
                Record Payment: {selectedPerson.name}
              </h4>
              <button onClick={() => setPaymentModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Payment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentDirection('received')}
                    className={`py-2 text-xs font-mono font-medium rounded-xl border transition-colors ${
                      paymentDirection === 'received'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Customer Paid Us
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentDirection('paid')}
                    className={`py-2 text-xs font-mono font-medium rounded-xl border transition-colors ${
                      paymentDirection === 'paid'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    We Paid Them
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Amount ({selectedPerson.currency})
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-mono font-bold bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl transition-colors"
                >
                  POST PAYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
