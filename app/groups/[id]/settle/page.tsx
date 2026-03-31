'use client';

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SettleView } from "@/components/settle-view";
import { ArrowLeft } from "lucide-react";

function paramToString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function GroupSettlePage() {
  const params = useParams();
  const id = paramToString(params.id);

  if (!id) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center sm:px-6 space-y-4">
        <h1 className="text-2xl font-bold">Invalid group link</h1>
        <p className="text-muted-foreground">
          This URL is missing a group id.
        </p>
        <Button asChild>
          <Link href="/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-950">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-900 dark:bg-slate-950/80">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border-2 border-transparent transition-all hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-800 dark:hover:bg-slate-900"
          asChild
        >
          <Link href={`/groups/${id}`}>
            <ArrowLeft size={20} className="stroke-[3]" />
          </Link>
        </Button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
          Settle Up
        </h1>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <SettleView groupId={id} />
      </main>
    </div>
  );
}

