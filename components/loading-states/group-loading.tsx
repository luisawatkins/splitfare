'use client';

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GroupSkeleton() {
  return (
    <Card className="p-4 flex items-center justify-between border-border/50 rounded-3xl shadow-sm">
      <div className="flex items-center gap-4 w-full">
        <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </Card>
  );
}

export function GroupListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <GroupSkeleton key={i} />
      ))}
    </div>
  );
}

export function GroupDetailsSkeleton() {
  return (
    <div className="container max-w-2xl py-8 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-full" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}
