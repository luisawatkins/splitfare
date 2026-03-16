"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { InviteShare } from "@/components/invite-share";
import { MemberList } from "@/components/member-list";
import { ExpenseList } from "@/components/expense-list";
import { BalanceView } from "@/components/balance-view";
import { BalanceSummary } from "@/components/balance-summary";
import { ActivityFeed } from "@/components/activity-feed";
import { QuickActions } from "@/components/quick-actions";
import { cn } from "@/lib/cn";
import { 
  Loader2, 
  ArrowLeft, 
  Settings, 
  Users, 
  Receipt, 
  Wallet,
  Calendar,
  Image as ImageIcon,
  History,
  Download
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toDbUserId } from "@/lib/privy-utils";
import { GroupDetailsSkeleton } from "@/components/loading-states/group-loading";
import { SettleView } from "@/components/settle-view";
import { GroupExport } from "@/components/group-export";
import { ShieldCheck } from "lucide-react";

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { user: privyUser, getAccessToken } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";
  const [activeTab, setActiveTab] = useState("expenses");

  const { data: group, isLoading: groupLoading, error } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      return apiClient.groups.get(id);
    },
    enabled: !!id && !!privyUser,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["group-members", id],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${id}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch members");
      return result.data;
    },
    enabled: !!id && !!privyUser,
  });

  const isLoading = groupLoading || membersLoading;

  const currentUserBalance = members?.find((m: any) => m.user?.id === currentUserId)?.balance || 0;

  const activities = [
    {
      id: "1",
      type: "expense" as const,
      content: "Alice added Dinner in SoHo",
      timestamp: new Date().toISOString(),
      user: { name: "Alice", avatar_url: null },
      amount: 132.40,
      currency: "USDC"
    },
    {
      id: "2",
      type: "join" as const,
      content: "Bob joined the group",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: { name: "Bob", avatar_url: null }
    }
  ];

  if (isLoading) {
    return <GroupDetailsSkeleton />;
  }

  if (error || !group) {
    return (
      <div className="container max-w-2xl py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <p className="text-muted-foreground">The group you're looking for doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link href="/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: "expenses", label: "Expenses", icon: <Receipt size={16} /> },
    { id: "balances", label: "Balances", icon: <History size={16} /> },
    { id: "settle", label: "Settle", icon: <Wallet size={16} /> },
    { id: "media", label: "Media", icon: <ImageIcon size={16} /> },
    { id: "export", label: "Export", icon: <Download size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-slate-900 bg-slate-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-900 border-2 border-transparent hover:border-slate-800 transition-all" asChild>
            <Link href="/dashboard">
              <ArrowLeft size={20} className="stroke-[3]" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black uppercase tracking-tight text-slate-50 leading-none">{group.name}</h1>
              <Link href={`/groups/${id}/verify`} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                <ShieldCheck size={10} className="stroke-[3]" />
                <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
              </Link>
            </div>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] text-slate-500 mt-1">{group.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {members?.slice(0, 3).map((m: any, i: number) => (
              <Avatar 
                key={i} 
                src={m.user?.avatar_url} 
                className="h-9 w-9 border-2 border-slate-950 shadow-brutalist-sm ring-1 ring-slate-800" 
                fallback={m.user?.name?.slice(0, 1).toUpperCase()} 
              />
            ))}
            {members && members.length > 3 && (
              <div className="h-9 w-9 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-brutalist-sm">
                +{members.length - 3}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-900 border-2 border-transparent hover:border-slate-800 transition-all">
            <Settings size={20} className="stroke-[3]" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-6 space-y-10">
        <BalanceSummary netBalance={currentUserBalance} currency={group.currency || "USDC"} />
        
        <QuickActions groupId={id} />

        <div className="space-y-4">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-800 shadow-brutalist-sm overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-1 whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-brand-pink text-slate-950 shadow-brutalist-sm border-2 border-slate-950/10" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {React.cloneElement(tab.icon as React.ReactElement, { 
                  className: cn("stroke-[3]", activeTab === tab.id ? "text-slate-950" : "text-slate-500") 
                })}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "expenses" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ExpenseList groupId={id} currentUserId={currentUserId} />
              </div>
            )}
            {activeTab === "balances" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BalanceView groupId={id} />
              </div>
            )}
            {activeTab === "settle" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SettleView groupId={id} />
              </div>
            )}
            {activeTab === "media" && (
              <Card className="p-12 text-center border-2 border-dashed border-slate-800 bg-slate-900/30 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Shared media and documents. Coming soon!</p>
              </Card>
            )}
            {activeTab === "export" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <GroupExport groupId={id} />
              </div>
            )}
          </div>
        </div>

        {group.invite_code && (
          <div className="pt-4">
            <InviteShare inviteCode={group.invite_code} groupName={group.name} />
          </div>
        )}
      </main>
    </div>
  );
}
