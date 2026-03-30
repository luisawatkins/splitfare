'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { MediaGrid } from '@/components/media-grid';
import { MediaUpload } from '@/components/media-upload';
import { usePrivy } from '@privy-io/react-auth';
import { toDbUserId } from '@/lib/privy-utils';

export default function GroupMediaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: privyUser } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";

  const { data: groupRes, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${id}`);
      if (!res.ok) throw new Error('Failed to fetch group');
      return res.json();
    },
  });

  const group = groupRes?.data;
  const isAdmin = group?.members?.find((m: any) => m.user_id === currentUserId)?.role === 'admin';

  if (groupLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-slate-900 bg-slate-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-900 border-2 border-transparent hover:border-slate-800 transition-all" asChild>
            <Link href={`/groups/${id}`}>
              <ArrowLeft size={20} className="stroke-[3]" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black uppercase tracking-tight text-slate-50 leading-none">{group?.name}</h1>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck size={10} className="stroke-[3]" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
              </span>
            </div>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] text-slate-500 mt-1">Shared Media</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-50">Media Gallery</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Photos and documents for this group</p>
          </div>
          <MediaUpload groupId={id} />
        </div>

        <MediaGrid groupId={id} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
