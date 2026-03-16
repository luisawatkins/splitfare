"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

interface GroupExportProps {
  groupId: string;
}

export function GroupExport({ groupId }: GroupExportProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rootCid, setRootCid] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { getAccessToken } = usePrivy();

  const handleExport = async () => {
    try {
      setStatus('loading');
      const token = await getAccessToken();
      
      const response = await fetch(`/api/groups/${groupId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to export data');
      }

      setRootCid(result.data.rootCid);
      setDownloadUrl(result.data.downloadUrl);
      setStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('error');
    }
  };

  return (
    <Card className="p-6 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-brutalist-sm space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center border-2 border-brand-pink/20">
          <Download className="text-brand-pink stroke-[2.5]" size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-50">Export Group Data</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Download a permanent CAR archive of this group
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <Button 
          onClick={handleExport}
          className="w-full h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-50 font-black uppercase tracking-widest text-[10px] shadow-brutalist-sm transition-all active:translate-y-0.5"
        >
          Generate Archive
        </Button>
      )}

      {status === 'loading' && (
        <Button 
          disabled
          className="w-full h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
        >
          <Loader2 className="animate-spin" size={16} />
          Creating Bundle...
        </Button>
      )}

      {status === 'success' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={16} className="stroke-[3]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Archive Ready</span>
          </div>
          
          <div className="p-3 bg-slate-950 rounded-xl border-2 border-slate-800 space-y-1">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Root CID</span>
            <code className="text-[10px] font-mono text-slate-400 break-all block leading-tight">
              {rootCid}
            </code>
          </div>

          <div className="flex gap-3">
            <Button 
              asChild
              className="flex-1 h-12 rounded-2xl bg-brand-pink border-2 border-slate-950 text-slate-950 font-black uppercase tracking-widest text-[10px] shadow-brutalist-sm hover:translate-y-[-2px] active:translate-y-0 transition-all"
            >
              <a href={downloadUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                Download CAR
                <ExternalLink size={14} className="stroke-[3]" />
              </a>
            </Button>
            <Button 
              onClick={() => setStatus('idle')}
              variant="ghost"
              className="h-12 px-6 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-200"
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertCircle size={16} className="stroke-[3]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Export Failed</span>
          </div>
          <Button 
            onClick={handleExport}
            className="w-full h-12 rounded-2xl bg-rose-500/10 border-2 border-rose-500/20 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500/20"
          >
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
}
