"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toDbUserId } from "@/lib/privy-utils";
import { DebtList } from "./debt-list";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceViewProps {
  groupId: string;
}

export function BalanceView({ groupId }: BalanceViewProps) {
  const { user: privyUser, getAccessToken } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["group-balances", groupId],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${groupId}/balances`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch balances");
      return result.data;
    },
    enabled: !!groupId && !!privyUser,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-60 w-full rounded-3xl" />
        <Skeleton className="h-20 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-500/5 rounded-3xl border border-rose-500/10">
        <p className="text-sm font-bold">Failed to load balances. Please try again.</p>
      </div>
    );
  }

  const { memberBalances, simplifiedDebts, userBalance } = data;
  const isOwed = userBalance?.balance > 0;
  const owes = userBalance?.balance < 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Net Balance Card */}
      <Card className={cn(
        "p-6 border-none overflow-hidden relative group",
        isOwed ? "bg-emerald-500 text-white" : owes ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
      )}>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">My Net Balance</span>
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {isOwed ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-5xl font-black tracking-tighter leading-none">
              {formatCurrency(Math.abs(userBalance?.balance || 0))}
            </p>
            <p className="text-xs font-bold opacity-70">
              {isOwed ? "total amount you are owed" : owes ? "total amount you owe" : "you are all settled up"}
            </p>
          </div>
        </div>
        
        {/* Background Accent */}
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
      </Card>

      {/* Simplified Debts */}
      <DebtList 
        debts={simplifiedDebts} 
        groupId={groupId} 
        currentUserId={currentUserId} 
      />

      {/* Member Breakdown Toggle */}
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          className="w-full h-14 rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all gap-3 px-4 justify-between"
          onClick={() => setShowMemberDetails(!showMemberDetails)}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Member Breakdown</span>
          </div>
          {showMemberDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        <AnimatePresence>
          {showMemberDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-2 pt-2">
                {memberBalances.map((member: any) => {
                  const mBalance = member.balance;
                  const isPos = mBalance > 0.01;
                  const isNeg = mBalance < -0.01;

                  return (
                    <div key={member.userId} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-3">
                        <Avatar src={member.avatarUrl} fallback={member.name.slice(0, 2).toUpperCase()} className="h-8 w-8" />
                        <span className="text-sm font-bold truncate max-w-[120px]">{member.userId === currentUserId ? "You" : member.name}</span>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-black leading-none",
                          isPos ? "text-emerald-500" : isNeg ? "text-rose-500" : "text-muted-foreground"
                        )}>
                          {isPos ? "+" : ""}{formatCurrency(mBalance)}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-1">
                          {isPos ? "is owed" : isNeg ? "owes" : "settled"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
