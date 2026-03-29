"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GroupListSkeleton } from "@/components/loading-states/group-loading";
import { usePrivy } from "@privy-io/react-auth";
import {
  resolvePrivyAccessToken,
  SIGN_IN_REQUIRED,
} from "@/lib/privy-token";

export default function GroupsPage() {
  const router = useRouter();
  const { ready, getAccessToken } = usePrivy();
  const { data: groups, isLoading, error, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const token = await resolvePrivyAccessToken(getAccessToken);
      if (!token) {
        throw new Error(SIGN_IN_REQUIRED);
      }
      apiClient.setToken(token);
      return apiClient.groups.list();
    },
    enabled: ready,
    retry: (_, err) =>
      err instanceof Error && err.message === SIGN_IN_REQUIRED ? false : true,
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <GroupListSkeleton count={4} />
      </div>
    );
  }

  if (error instanceof Error && error.message === SIGN_IN_REQUIRED) {
    return (
      <div className="container max-w-2xl py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Load your groups after signing in. Refresh the page, or return home and open the app again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">Could not load groups</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetch()}>Try again</Button>
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
            <Link key={group.id} href={`/groups/${group.id}`}>
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
