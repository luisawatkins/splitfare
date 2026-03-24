"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { ArrowRight, Wallet, CheckCircle2, ChevronRight, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export interface Debt {
  from: { id: string; name: string };
  to: { id: string; name: string };
  amount: number;
}

interface DebtListProps {
  debts: Debt[];
  groupId: string;
  currentUserId: string;
}

export function DebtList({ debts, groupId, currentUserId }: DebtListProps) {
  const [nudging, setNudging] = useState<string | null>(null);
  const { notify } = useToast();

  const handleNudge = async (receiverId: string) => {
    try {
      setNudging(receiverId);
      const response = await fetch(`/api/groups/${groupId}/remind/${receiverId}`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        notify({
          title: "Nudge sent!",
          description: "We've sent a reminder to settle the debt.",
        });
      } else {
        notify({
          title: "Could not send nudge",
          description: result.error || "Please try again later.",
          variant: "error",
        });
      }
    } catch (err) {
      console.error('Error sending nudge:', err);
      notify({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setNudging(null);
    }
  };

  if (debts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center space-y-4"
      >
        <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-500">All Settled Up!</h3>
          <p className="text-xs text-muted-foreground font-medium px-10 leading-relaxed">
            There are no outstanding debts in this group. Time to celebrate!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
        Simplified Debts
      </h3>
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {debts.map((debt, index) => {
            const isInvolved = debt.from.id === currentUserId || debt.to.id === currentUserId;
            const isDebtor = debt.from.id === currentUserId;

            return (
              <motion.div
                key={`${debt.from.id}-${debt.to.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-4 border-border/50 transition-all group",
                  isInvolved ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                )}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <Avatar fallback={debt.from.name.slice(0, 2).toUpperCase()} className="h-8 w-8" />
                        <span className="text-[10px] font-bold truncate max-w-[60px] text-center">
                          {debt.from.id === currentUserId ? "You" : debt.from.name}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-full flex items-center gap-2">
                          <div className="h-px flex-1 bg-border relative">
                            <ArrowRight className="h-3 w-3 text-muted-foreground absolute right-0 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                          {formatCurrency(debt.amount)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <Avatar fallback={debt.to.name.slice(0, 2).toUpperCase()} className="h-8 w-8" />
                        <span className="text-[10px] font-bold truncate max-w-[60px] text-center">
                          {debt.to.id === currentUserId ? "You" : debt.to.name}
                        </span>
                      </div>
                    </div>

                    {isDebtor ? (
                      <Button 
                        size="sm" 
                        className="h-9 rounded-xl font-black uppercase tracking-tighter gap-2 shrink-0"
                        asChild
                      >
                        <Link href={`/groups/${groupId}/settle?to=${debt.to.id}&amount=${debt.amount}`}>
                          <Wallet className="h-4 w-4" />
                          Settle
                        </Link>
                      </Button>
                    ) : debt.to.id === currentUserId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-xl font-black uppercase tracking-tighter gap-2 shrink-0 border-primary/20 hover:bg-primary/5"
                        onClick={() => handleNudge(debt.from.id)}
                        disabled={nudging === debt.from.id}
                      >
                        <BellRing className={cn("h-4 w-4", nudging === debt.from.id && "animate-bounce")} />
                        Nudge
                      </Button>
                    ) : null}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
