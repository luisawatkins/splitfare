'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { apiClient } from '@/lib/api-client';
import { displayUserIdentity } from '@/lib/ens';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, Bell, Search, Plus, Users, Receipt, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      return apiClient.users.me();
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient.groups.list(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const identity = user ? displayUserIdentity(user) : 'Guest';

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Avatar 
            src={user?.avatar_url || undefined} 
            fallback={identity ? identity.slice(0, 2).toUpperCase() : 'GS'} 
          />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight">{identity}</h1>
            {user?.ens_name && (
              <Badge variant="secondary" className="w-fit h-4 text-[10px] px-1 py-0">
                ENS Verified
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-4">
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              placeholder="Search expenses..." 
              className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </section>

        <Card className="p-6 bg-yellow-400 text-slate-950 border-none shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold uppercase tracking-wider opacity-70">Total Balance</p>
            <div className="bg-slate-950/10 p-2 rounded-xl">
              <Receipt size={20} />
            </div>
          </div>
          <h2 className="text-4xl font-black">$0.00</h2>
          <div className="mt-6 flex gap-2">
            <Button className="flex-1 bg-slate-950 text-white hover:bg-slate-800 border-none rounded-xl h-11">
              Settle Up
            </Button>
            <Button size="icon" className="h-11 w-11 bg-slate-950 text-white hover:bg-slate-800 border-none rounded-xl">
              <Plus />
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/groups/create" className="block">
            <Card className="p-4 flex flex-col items-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-muted/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-tighter opacity-60">Groups</span>
              <span className="text-xl font-black">{groups?.length || 0}</span>
            </Card>
          </Link>
          <Card className="p-4 flex flex-col items-center gap-2 border-slate-200 dark:border-slate-800">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Receipt size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tighter opacity-60">Expenses</span>
            <span className="text-xl font-black">0</span>
          </Card>
        </div>
      </main>

      <TabBar 
        items={[
          { key: "home", label: "Home", icon: <Home size={20} /> },
          { key: "groups", label: "Groups", icon: <Users size={20} /> },
          { key: "expenses", label: "Expenses", icon: <Receipt size={20} /> },
          { key: "settings", label: "Settings", icon: <Settings size={20} /> },
        ]}
        activeKey="home"
        onChange={(key) => {
          if (key === "groups") {
            router.push("/groups");
          }
        }}
      />
    </div>
  );
}
