import React from 'react';
import { Shield, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useAccounting();

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1">
          Provenance & Traceability
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Immutable System Audit Log
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Complete provenance. Every parse, post, reversal, and invoice action is recorded with entity scoping.
        </p>
      </div>

      {/* Audit List */}
      <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 divide-y divide-zinc-800/60 overflow-hidden shadow-xs">
        {auditLogs.map((log) => {
          const formattedAction = log.action
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
          const isVoid = log.action.includes('VOID') || log.action.includes('REJECT');
          const isSuccess = log.action.includes('POST') || log.action.includes('LOGIN') || log.action.includes('VERIFIED');

          return (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors flex items-start gap-3.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isVoid
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : isSuccess
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {isVoid ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                    {formattedAction}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{log.details}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-mono text-zinc-500 mt-2">
                  <span>By: {log.performedBy}</span>
                  <span>•</span>
                  <span>Entity: {log.entityId}</span>
                  {log.transactionId && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400">Ref: {log.transactionId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {auditLogs.length === 0 && (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs">
            No audit records captured yet.
          </div>
        )}
      </div>
    </div>
  );
};
