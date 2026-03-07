"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import { toDbUserId } from "@/lib/privy-utils";
import { GroupCard } from "@/components/group-card";
import { BalanceSummary } from "@/components/balance-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Users, Receipt, Search, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user: privyUser, getAccessToken } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";

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
      const groups = await apiClient.groups.list();
      const memberships = await Promise.all(
        groups.map(async (group) => {
          const res = await fetch(`/api/groups/${group.id}/members`);
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
        <div className="h-8 w-48 bg-muted animate-pulse rounded-2xl" />
        <div className="h-48 w-full bg-muted animate-pulse rounded-3xl" />
        <div className="space-y-3 pt-6">
          <div className="h-4 w-32 bg-muted animate-pulse rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-8 min-h-screen">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Avatar 
            src={user?.avatar_url || undefined} 
            fallback={user?.name?.slice(0, 2).toUpperCase() || "SF"} 
            className="h-10 w-10 border-2 border-primary/20 shadow-lg shadow-primary/10"
          />
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter uppercase opacity-40">Good Morning,</h1>
            <span className="text-xl font-black tracking-tighter leading-tight uppercase">{user?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-muted/50 hover:bg-muted transition-all active:scale-90">
            <Search size={20} className="stroke-[2.5]" />
          </Button>
          <Button variant="ghost" size="icon" className="relative rounded-2xl bg-muted/50 hover:bg-muted transition-all active:scale-90">
            <Bell size={20} className="stroke-[2.5]" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-background ring-1 ring-rose-500/20" />
          </Button>
        </div>
      </header>

      <BalanceSummary netBalance={totalBalance} currency="USDC" />

      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Your Groups</h3>
          <Link href="/groups/create">
            <Button variant="ghost" size="sm" className="text-xs font-black uppercase tracking-tighter text-primary hover:bg-primary/10 rounded-xl">
              <Plus size={16} className="mr-1 stroke-[3]" />
              New Group
            </Button>
          </Link>
        </div>

        {!members || members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12 stroke-[2.5]" />}
            title="No Groups Found"
            description="Start by creating a group to split expenses with your friends."
            actionLabel="Create Group"
            onActionClick={() => (window.location.href = "/groups/create")}
            className="py-12 bg-muted/20 border-border/50 rounded-3xl"
          />
        ) : (
          <div className="space-y-3">
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
                  currency={m.group.currency}
                  avatarUrl={m.group.avatar_url}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Link href="/groups/create" className="md:hidden fixed bottom-24 right-6 z-50">
        <Button className="h-16 w-16 rounded-full bg-primary shadow-2xl shadow-primary/40 active:scale-90 transition-all duration-300">
          <Plus size={32} className="stroke-[3]" />
        </Button>
      </Link>
    </div>
  );
}
