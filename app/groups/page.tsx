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
  const { ready, authenticated, login, getAccessToken } = usePrivy();
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
    enabled: ready && authenticated,
    retry: (_, err) =>
      err instanceof Error && err.message === SIGN_IN_REQUIRED ? false : true,
  });

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <GroupListSkeleton count={4} />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Your groups
        </h1>
        <p className="mx-auto max-w-md text-slate-600 dark:text-slate-400">
          Sign in to view and manage groups you belong to.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
            onClick={() => login()}
          >
            Sign in
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <GroupListSkeleton count={4} />
      </div>
    );
  }

  if (error instanceof Error && error.message === SIGN_IN_REQUIRED) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Session refresh needed
        </h1>
        <p className="mx-auto max-w-md text-slate-600 dark:text-slate-400">
          We could not get a valid session token. Try signing in again, or go home and reopen the app.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button onClick={() => login()}>Sign in again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Could not load groups
        </h1>
        <p className="text-slate-600 dark:text-slate-400">{error.message}</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Groups</h1>
        <Link href="/groups/create">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 p-2 text-white hover:bg-violet-700 transition-colors">
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
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 rounded-2xl"
            >
              <Card className="p-4 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 flex items-center justify-center font-bold text-xl">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{group.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 uppercase bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        {group.category}
                      </Badge>
                      {group.description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
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
