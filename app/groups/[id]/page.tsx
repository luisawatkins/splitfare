"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteShare } from "@/components/invite-share";
import { MemberList } from "@/components/member-list";
import { Loader2, ArrowLeft, Settings, Users, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toDbUserId } from "@/lib/privy-utils";

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { user: privyUser } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";

  const { data: group, isLoading, error } = useQuery({
    queryKey: ["group", id],
    queryFn: () => apiClient.groups.get(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/groups">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-sm font-bold tracking-tight">{group.name}</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Settings size={20} />
        </Button>
      </header>

      <main className="mx-auto max-w-2xl p-4 space-y-6">
        <Card className="p-6 bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-white/20 text-white border-none uppercase text-[10px]">
                {group.category}
              </Badge>
              <div className="flex items-center text-xs font-medium opacity-80">
                <Wallet className="h-3 w-3 mr-1" />
                {group.currency}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black">{group.name}</h2>
              {group.description && (
                <p className="text-sm opacity-80 mt-1 line-clamp-2">{group.description}</p>
              )}
            </div>
            <div className="pt-2 flex gap-2">
              <Button className="flex-1 bg-white text-primary hover:bg-white/90 border-none rounded-xl h-11 font-bold">
                Add Expense
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col items-center gap-2 border-border/50 bg-card/50">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Receipt size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tighter opacity-60">Total Spent</span>
            <span className="text-xl font-black">$0.00</span>
          </Card>
          <Card className="p-4 flex flex-col items-center gap-2 border-border/50 bg-card/50">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tighter opacity-60">Members</span>
            <span className="text-xl font-black">1</span>
          </Card>
        </div>

        {group.invite_code && (
          <InviteShare inviteCode={group.invite_code} groupName={group.name} />
        )}

        <MemberList groupId={id} currentUserId={currentUserId} />

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 px-1">Recent Activity</h3>
          <Card className="p-8 text-center border-dashed bg-muted/30">
            <p className="text-sm text-muted-foreground">No expenses yet. Start by adding one!</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
