"use client";

import { cn } from "@/lib/cn";
import { format } from "date-fns";
import { 
  Receipt, 
  Wallet, 
  Anchor, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ArrowDown
} from "lucide-react";
import { motion } from "framer-motion";

interface AuditItem {
  id: string;
  type: 'expense' | 'receipt' | 'settlement' | 'manifest' | 'anchor';
  title: string;
  timestamp: string;
  amount?: number;
  currency?: string;
  cid?: string;
  txHash?: string;
  status?: string;
}

interface AuditTrailProps {
  timeline: AuditItem[];
  onItemClick?: (item: AuditItem) => void;
}

export function AuditTrail({ timeline, onItemClick }: AuditTrailProps) {
  const getTypeColor = (type: AuditItem['type']) => {
    switch (type) {
      case 'expense': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'receipt': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'settlement': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'manifest': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'anchor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: AuditItem['type']) => {
    switch (type) {
      case 'expense': return <Receipt size={14} className="stroke-[2.5]" />;
      case 'receipt': return <ImageIcon size={14} className="stroke-[2.5]" />;
      case 'settlement': return <Wallet size={14} className="stroke-[2.5]" />;
      case 'manifest': return <FileText size={14} className="stroke-[2.5]" />;
      case 'anchor': return <Anchor size={14} className="stroke-[2.5]" />;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800/50" />
      
      {timeline.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative pl-12"
        >
          <div className={cn(
            "absolute left-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-brutalist-sm bg-slate-950 z-10",
            getTypeColor(item.type)
          )}>
            {getTypeIcon(item.type)}
          </div>

          <div 
            onClick={() => onItemClick?.(item)}
            className={cn(
              "p-4 rounded-[2rem] border-2 border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer shadow-brutalist-sm",
              item.type === 'anchor' ? "border-purple-500/30" : ""
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-black uppercase tracking-tight text-slate-50">{item.title}</h4>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                {format(new Date(item.timestamp), "MMM d, HH:mm")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {item.amount !== undefined && (
                <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-black text-slate-400">
                  {item.amount} {item.currency}
                </div>
              )}
              {item.cid && (
                <div className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                  {item.cid.slice(0, 10)}...
                </div>
              )}
              {item.status && (
                <div className={cn(
                  "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                  item.status === 'ANCHORED' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                )}>
                  {item.status}
                </div>
              )}
            </div>
          </div>
          
          {index < timeline.length - 1 && (
            <div className="flex justify-center w-12 mt-4 text-slate-800">
              <ArrowDown size={12} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
