"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import Link from "next/link";

interface GroupExportProps {
  groupId: string;
}

export function GroupExport({ groupId }: GroupExportProps) {
  return (
    <Card className="p-6 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-brutalist-sm space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center border-2 border-brand-pink/20">
          <Download className="text-brand-pink stroke-[2.5]" size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-50">Export Group Data</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            JSON, CSV, PDF & Permanent CAR Archive
          </p>
        </div>
      </div>

      <Button 
        asChild
        className="w-full h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-50 font-black uppercase tracking-widest text-[10px] shadow-brutalist-sm transition-all active:translate-y-0.5"
      >
        <Link href={`/groups/${groupId}/export`}>
          Go to Export Center
        </Link>
      </Button>
    </Card>
  );
}
