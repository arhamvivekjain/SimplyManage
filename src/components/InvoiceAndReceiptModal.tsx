import React, { useState } from 'react';
import {
  X,
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Receipt,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, CanonicalTransaction } from '../types';

interface InvoiceAndReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'create-invoice' | 'scan-receipt';
}

export const InvoiceAndReceiptModal: React.FC<InvoiceAndReceiptModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'create-invoice',
}) => {
  const { createInvoice, postCanonicalTransaction, activeEntity, people } = useAccounting();

  const [activeTab, setActiveTab] = useState<'invoice' | 'receipt'>(
    initialMode === 'scan-receipt' ? 'receipt' : 'invoice'
  );

  // Guided Invoice State
  const [invWho, setInvWho] = useState('Sarah');
  const [invWhat, setInvWhat] = useState('Brand Identity & UI Design Services');
  const [invAmount, setInvAmount] = useState('1500');
  const [invDueDays, setInvDueDays] = useState('14');
  const [invoiceCreatedResult, setInvoiceCreatedResult] = useState<Invoice | null>(null);

  // Receipt Scanner State
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    merchant: string;
    date: string;
    product: string;
    quantity: number;
    price: number;
    vat: number;
    total: number;
    invoiceNumber: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invAmount);
    if (isNaN(amt) || amt <= 0) return;

    const due = new Date();
    due.setDate(due.getDate() + parseInt(invDueDays, 10));

    const newInv = createInvoice({
      counterparty: invWho,
      description: invWhat,
      amount: amt,
      dueDate: due.toISOString().split('T')[0],
      currency: activeEntity.baseCurrency,
    });

    setInvoiceCreatedResult(newInv);
  };

  const handleSimulateScan = (receiptPreset?: {
    merchant: string;
    product: string;
    price: number;
    vat: number;
  }) => {
    setScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      const preset = receiptPreset || {
        merchant: 'Amazon UAE',
        product: 'MacBook Pro 16" Sleeve & USB-C Multiport Hub',
        price: 380,
        vat: 19,
      };
      const total = preset.price + preset.vat;
      const today = new Date().toISOString().split('T')[0];

      setScannedResult({
        merchant: preset.merchant,
        date: today,
        product: preset.product,
        quantity: 1,
        price: preset.price,
        vat: preset.vat,
        total,
        invoiceNumber: `AMZ-${Math.floor(10000 + Math.random() * 90000)}`,
      });
      setScanning(false);
    }, 900);
  };

  const handleCommitScannedReceipt = () => {
    if (!scannedResult) return;

    postCanonicalTransaction({
      originalInput: `Scanned receipt from ${scannedResult.merchant} for ${scannedResult.product} totaling ${activeEntity.baseCurrency} ${scannedResult.total}`,
      description: `${scannedResult.merchant} — ${scannedResult.product}`,
      amount: scannedResult.total,
      currency: activeEntity.baseCurrency,
      counterparty: scannedResult.merchant,
      counterpartyRole: 'supplier',
      paymentMethod: 'Emirates NBD',
      transactionType: 'expense',
      invoiceNumber: scannedResult.invoiceNumber,
      journalLines: [
        { accountCode: '5060', accountName: 'Office Supplies Expense', debit: scannedResult.price, credit: 0 },
        { accountCode: '2030', accountName: 'VAT Input Tax', debit: scannedResult.vat, credit: 0 },
        { accountCode: '1020', accountName: 'Emirates NBD', debit: 0, credit: scannedResult.total },
      ],
      relevantBook: 'Purchases Day Book',
      explanation: `Extracted from receipt ${scannedResult.invoiceNumber}. Includes 5% VAT input tax breakdown.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Segmented Switcher */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('invoice');
                setInvoiceCreatedResult(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'invoice'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Guided Invoice
            </button>
            <button
              onClick={() => {
                setActiveTab('receipt');
                setScannedResult(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'receipt'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Scan Receipt / OCR
            </button>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'invoice' ? (
            /* Guided Invoice Creation Flow */
            <div>
              {!invoiceCreatedResult ? (
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Guided Invoice Creation</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Answer natural questions to automatically generate an invoice with double-entry links.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Q1: Who is this invoice for? */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        1. Who is this invoice for?
                      </label>
                      <input
                        type="text"
                        value={invWho}
                        onChange={(e) => setInvWho(e.target.value)}
                        placeholder="Client or customer name..."
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>

                    {/* Q2: What are you charging for? */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        2. What are you charging for?
                      </label>
                      <input
                        type="text"
                        value={invWhat}
                        onChange={(e) => setInvWhat(e.target.value)}
                        placeholder="e.g. Design consulting, web development, product batch..."
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                        required
                      />
                    </div>

                    {/* Q3: How much? */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-stone-700 block mb-1">
                          3. How much ({activeEntity.baseCurrency})?
                        </label>
                        <input
                          type="number"
                          value={invAmount}
                          onChange={(e) => setInvAmount(e.target.value)}
                          placeholder="e.g. 1500"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono"
                          required
                        />
                      </div>

                      {/* Q4: When is it due? */}
                      <div>
                        <label className="text-xs font-semibold text-stone-700 block mb-1">
                          4. Due timeframe
                        </label>
                        <select
                          value={invDueDays}
                          onChange={(e) => setInvDueDays(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                        >
                          <option value="7">Due in 7 days</option>
                          <option value="14">Due in 14 days (Net 14)</option>
                          <option value="30">Due in 30 days (Net 30)</option>
                          <option value="0">Due on receipt</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-black flex items-center gap-1.5"
                    >
                      <span>Generate Invoice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Invoice Created Confirmation */
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">Invoice Generated & Registered</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Invoice <strong>{invoiceCreatedResult.invoiceNumber}</strong> for {invoiceCreatedResult.counterparty} ({activeEntity.baseCurrency} {invoiceCreatedResult.amount.toLocaleString()}) has been stored.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Invoice Number:</span>
                      <span className="font-mono font-bold text-stone-900">{invoiceCreatedResult.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Counterparty:</span>
                      <span className="font-medium text-stone-900">{invoiceCreatedResult.counterparty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Service:</span>
                      <span className="font-medium text-stone-900">{invoiceCreatedResult.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Due Date:</span>
                      <span className="font-medium text-stone-900">{invoiceCreatedResult.dueDate}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-stone-200">
                      <span className="text-stone-800">Total Amount:</span>
                      <span className="font-mono text-stone-900">{activeEntity.baseCurrency} {invoiceCreatedResult.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setInvoiceCreatedResult(null)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                      Create Another
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-black"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Receipt / Invoice Scanning Flow */
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Receipt & Document Extraction</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  AI extracts merchant, date, product, VAT, and total, converting it into a proposed accounting transaction.
                </p>
              </div>

              {/* Upload Drop Zone / Sample Picker */}
              <div className="p-6 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-800">
                    Drag receipt image or screenshot here
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Supports PNG, JPG, PDF documents</div>
                </div>

                <div className="pt-2 flex justify-center gap-2 flex-wrap">
                  <span className="text-[11px] text-stone-400 self-center">Or simulate with sample:</span>
                  <button
                    onClick={() =>
                      handleSimulateScan({
                        merchant: 'Amazon UAE',
                        product: 'MacBook Sleeve & USB-C Adapter',
                        price: 380,
                        vat: 19,
                      })
                    }
                    className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg shadow-2xs"
                  >
                    Amazon Receipt (AED 399)
                  </button>
                  <button
                    onClick={() =>
                      handleSimulateScan({
                        merchant: 'Apple Store Dubai Mall',
                        product: 'Magic Keyboard & Mouse',
                        price: 850,
                        vat: 42.5,
                      })
                    }
                    className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg shadow-2xs"
                  >
                    Apple Store Receipt (AED 892.50)
                  </button>
                </div>
              </div>

              {/* Loading indicator */}
              {scanning && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-600 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                  <span>Extracting merchant, line items, and VAT tax...</span>
                </div>
              )}

              {/* Extracted Structured Record */}
              {scannedResult && !scanning && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Extracted Structured Record
                    </span>
                    <span className="font-mono text-xs text-emerald-900">{scannedResult.invoiceNumber}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-white/80 rounded border border-emerald-100">
                      <span className="text-stone-400 block text-[10px]">Merchant</span>
                      <span className="font-semibold text-stone-900">{scannedResult.merchant}</span>
                    </div>
                    <div className="p-2 bg-white/80 rounded border border-emerald-100">
                      <span className="text-stone-400 block text-[10px]">Date</span>
                      <span className="font-semibold text-stone-900">{scannedResult.date}</span>
                    </div>
                    <div className="p-2 bg-white/80 rounded border border-emerald-100">
                      <span className="text-stone-400 block text-[10px]">VAT (5%)</span>
                      <span className="font-semibold font-mono text-stone-900">
                        {activeEntity.baseCurrency} {scannedResult.vat}
                      </span>
                    </div>
                    <div className="p-2 bg-white/80 rounded border border-emerald-100">
                      <span className="text-stone-400 block text-[10px]">Total</span>
                      <span className="font-bold font-mono text-emerald-900">
                        {activeEntity.baseCurrency} {scannedResult.total}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600">
                    <span className="font-semibold text-stone-700">Line item:</span>{' '}
                    {scannedResult.product} (Qty: {scannedResult.quantity})
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-emerald-100">
                    <button
                      onClick={() => setScannedResult(null)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                      Rescan
                    </button>
                    <button
                      onClick={handleCommitScannedReceipt}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Post to Accounting Engine</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
