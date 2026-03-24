"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import { toDbUserId } from "@/lib/privy-utils";
import { cn } from "@/lib/cn";
import { GroupCard } from "@/components/group-card";
import { BalanceSummary } from "@/components/balance-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Users, Receipt, Search, Bell, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { GroupListSkeleton } from "@/components/loading-states/group-loading";
import { ChainBalances } from "@/components/chain-balances";
import { useState } from "react";

export default function DashboardPage() {
  const { user: privyUser, getAccessToken } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";
  const [activeTab, setActiveTab] = useState<'groups' | 'wallet'>('groups');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      return apiClient.users.me();
    },
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["all-memberships"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        return [];
      }

      apiClient.setToken(token);
      const groups = await apiClient.groups.list();
      const memberships = await Promise.all(
        groups.map(async (group) => {
          const res = await fetch(`/api/groups/${group.id}/members`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const result = await res.json();
          const userMembership = result.data.find((m: any) => m.user.id === currentUserId);
          return {
            group,
            balance: userMembership?.balance || 0,
            memberCount: result.data.length
          };
        })
      );
      return memberships;
    },
    enabled: !!currentUserId
  });

  const isLoading = userLoading || membersLoading;

  const totalBalance = members?.reduce((sum, m) => sum + m.balance, 0) || 0;

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-2xl" />
        <div className="h-48 w-full bg-muted animate-pulse rounded-3xl" />
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center px-1">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded-xl" />
          </div>
          <GroupListSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10 space-y-10 min-h-screen bg-slate-950">
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar 
              src={user?.avatar_url || undefined} 
              fallback={user?.name?.slice(0, 2).toUpperCase() || "SF"} 
              className="h-14 w-14 border-2 border-slate-900 shadow-brutalist-sm bg-brand-pink text-slate-950 font-black text-xl"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Good Morning,</h1>
            <span className="text-2xl font-black tracking-tight leading-none uppercase text-slate-50">{user?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all active:translate-y-0.5 shadow-brutalist-sm h-11 w-11">
            <Search size={20} className="stroke-[3] text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="relative rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all active:translate-y-0.5 shadow-brutalist-sm h-11 w-11">
            <Bell size={20} className="stroke-[3] text-slate-400" />
            <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-rose-500 border-2 border-slate-950" />
          </Button>
        </div>
      </header>

      <BalanceSummary netBalance={totalBalance} currency="USDC" />

      <div className="flex p-1 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-brutalist-sm">
        <button 
          onClick={() => setActiveTab('groups')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'groups' ? "bg-brand-pink text-slate-950 shadow-brutalist-sm" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Users size={16} className={activeTab === 'groups' ? "stroke-[3]" : "stroke-[2]"} />
          Groups
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'wallet' ? "bg-brand-yellow text-slate-950 shadow-brutalist-sm" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Wallet size={16} className={activeTab === 'wallet' ? "stroke-[3]" : "stroke-[2]"} />
          Unified Wallet
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'groups' ? (
          <motion.section 
            key="groups"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 pt-4"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Your Groups</h3>
              <Link href="/groups/create">
                <Button variant="ghost" size="sm" className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-pink hover:bg-brand-pink/10 rounded-xl px-4 h-9 border-2 border-transparent hover:border-brand-pink/20 transition-all">
                  <Plus size={16} className="mr-1.5 stroke-[4]" />
                  New Group
                </Button>
              </Link>
            </div>

            {!members || members.length === 0 ? (
              <EmptyState
                icon={<Users className="h-14 w-14 stroke-[3] text-brand-pink" />}
                title="No Groups Found"
                description="Start by creating a group to split expenses with your friends."
                actionLabel="Create Group"
                onActionClick={() => (window.location.href = "/groups/create")}
                className="py-16 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem]"
              />
            ) : (
              <div className="space-y-4">
                {members.map((m, index) => (
                  <motion.div
                    key={m.group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GroupCard
                      id={m.group.id}
                      name={m.group.name}
                      category={m.group.category}
                      memberCount={m.memberCount}
                      userBalance={m.balance}
                      currency={m.group.currency || "USDC"}
                      avatarUrl={m.group.avatar_url}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="wallet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pt-4"
          >
            <ChainBalances />
          </motion.section>
        )}
      </AnimatePresence>

      <Link href="/groups/create" className="md:hidden fixed bottom-28 right-6 z-50">
        <Button className="h-16 w-16 rounded-full bg-brand-pink text-slate-950 border-2 border-slate-900 shadow-brutalist hover:shadow-brutalist-lg active:translate-y-1 active:shadow-none transition-all duration-300">
          <Plus size={32} className="stroke-[4]" />
        </Button>
      </Link>
    </div>
  );
}
