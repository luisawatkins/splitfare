"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, History, Search, Filter, Calendar } from "lucide-react";
import Link from "next/link";
import { AuditTrail } from "@/components/audit-trail";
import { VerificationReportDisplay } from "@/components/verification-report";
import { VerificationReport } from "@/services/verifier";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: timeline, isLoading: timelineLoading, refetch: refetchTimeline } = useQuery({
    queryKey: ["audit-trail", id],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${id}/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Failed to fetch audit trail");
      return result.data;
    },
    enabled: !!id
  });

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || "Verification failed");
      setReport(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-slate-900 bg-slate-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-900 border-2 border-transparent hover:border-slate-800 transition-all" asChild>
            <Link href={`/groups/${id}`}>
              <ArrowLeft size={20} className="stroke-[3]" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-base font-black uppercase tracking-tight text-slate-50 leading-none">Data Integrity</h1>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] text-slate-500 mt-1">Audit Trail & Verification</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleVerify}
            disabled={isVerifying}
            className="rounded-xl bg-brand-pink text-slate-950 border-2 border-slate-950 shadow-brutalist-sm hover:translate-y-[-2px] active:translate-y-0 transition-all font-black text-[10px] uppercase tracking-widest px-4 h-11"
          >
            {isVerifying ? "Verifying..." : "Verify Now"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-6 space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={18} />
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-50">Integrity Check</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Last Verified: {report ? "Just now" : "Never"}</span>
          </div>

          <VerificationReportDisplay report={report} isLoading={isVerifying} />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <History className="text-blue-400" size={18} />
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-50">Audit Trail</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800">
                <Search size={14} className="text-slate-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800">
                <Filter size={14} className="text-slate-500" />
              </Button>
            </div>
          </div>

          {timelineLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-full bg-slate-900/50 border-2 border-slate-800 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <AuditTrail timeline={timeline || []} />
          )}
        </section>
      </main>
    </div>
  );
}
