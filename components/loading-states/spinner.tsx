'use client';

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function LoadingSpinner({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
      <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">
        Splitting Fares...
      </p>
    </div>
  );
}
