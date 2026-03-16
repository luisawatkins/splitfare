"use client";

import { cn } from "@/lib/cn";
import { CheckCircle2, AlertCircle, Loader2, History, Anchor, Database } from "lucide-react";
import { VerificationReport } from "@/services/verifier";

interface VerificationReportProps {
  report: VerificationReport | null;
  isLoading: boolean;
}

export function VerificationReportDisplay({ report, isLoading }: VerificationReportProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-brutalist-sm">
        <Loader2 className="animate-spin text-brand-pink mx-auto mb-4" size={32} />
        <h3 className="text-sm font-black uppercase tracking-tight text-slate-50">Running Integrity Check</h3>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Fetching CAR from Storacha & Parsing DAG</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className={cn(
        "p-6 rounded-[2.5rem] border-2 shadow-brutalist-sm",
        report.isValid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center border-2",
              report.isValid ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-rose-500/20 border-rose-500/30 text-rose-400"
            )}>
              {report.isValid ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-50">
                {report.isValid ? "Integrity Verified" : "Verification Failed"}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                {report.isValid ? "All records match decentralized storage" : "Mismatched or missing records detected"}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
            {new Date(report.timestamp).toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <Anchor size={18} className="text-purple-400" />
            <div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">On-Chain Records</span>
              <span className="text-base font-black text-slate-50 leading-none">{report.onChainRecordCount}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <Database size={18} className="text-brand-pink" />
            <div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Bundle Records</span>
              <span className="text-base font-black text-slate-50 leading-none">{report.bundleRecordCount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Verification Checks</h4>
          {report.checks.map((check, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                {check.status === 'passed' ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={14} className="text-rose-400" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{check.name}</span>
              </div>
              {check.details && (
                <span className="text-[8px] font-mono text-slate-600 italic">{check.details}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-between shadow-brutalist-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
            <History size={16} className="text-slate-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Root CID Verified</span>
        </div>
        <code className="text-[10px] font-mono text-slate-500">{report.rootCid.slice(0, 16)}...</code>
      </div>
    </div>
  );
}
