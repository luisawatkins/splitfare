"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function GroupsPage() {
  const router = useRouter();
  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => apiClient.groups.list(),
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 h-20 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Groups</h1>
        <Link href="/groups/create">
          <button className="inline-flex items-center justify-center rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </Link>
      </div>

      {!groups || groups.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No groups yet"
          description="Create a group to start splitting expenses with friends."
          actionLabel="Create Group"
          onActionClick={() => router.push("/groups/create")}
          className="py-12"
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 uppercase">
                        {group.category}
                      </Badge>
                      {group.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {group.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
