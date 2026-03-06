"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Shield, Crown, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { MemberActions } from "./member-actions";
import { cn } from "@/lib/cn";

type Member = {
  id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user: {
    id: string;
    name: string;
    username: string;
    ens_name: string | null;
    avatar_url: string | null;
    wallet_address: string | null;
  };
  balance: number;
};

type MemberListProps = {
  groupId: string;
  currentUserId: string;
};

export function MemberList({ groupId, currentUserId }: MemberListProps) {
  const { data: members, isLoading, refetch } = useQuery<Member[]>({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/members`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch members");
      return result.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentUserMembership = members?.find(m => m.user.id === currentUserId);
  const currentUserRole = currentUserMembership?.role || 'member';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
          Members ({members?.length || 0})
        </h3>
      </div>

      <div className="space-y-3">
        {members?.map((member) => (
          <Card key={member.id} className="p-4 flex items-center justify-between border-border/50 hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar 
                  src={member.user.avatar_url || undefined} 
                  fallback={member.user.name.slice(0, 2).toUpperCase()} 
                  className="h-12 w-12 border-2 border-border/50 group-hover:border-primary/50 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border shadow-sm">
                  {member.role === 'owner' ? (
                    <Crown className="h-3 w-3 text-amber-500" />
                  ) : member.role === 'admin' ? (
                    <Shield className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <User className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">
                    {member.user.name}
                    {member.user.id === currentUserId && (
                      <span className="ml-2 text-[10px] font-bold uppercase text-primary tracking-wider">(You)</span>
                    )}
                  </h4>
                  {member.user.ens_name && (
                    <Badge variant="secondary" className="text-[9px] px-1 h-3 uppercase border-none bg-primary/10 text-primary">
                      ENS
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{member.role}</span>
                  <span>•</span>
                  <div className={cn(
                    "flex items-center gap-1 font-medium",
                    member.balance > 0 ? "text-emerald-500" : member.balance < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {member.balance > 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3" />
                        Owed ${member.balance.toFixed(2)}
                      </>
                    ) : member.balance < 0 ? (
                      <>
                        <ArrowDownLeft className="h-3 w-3" />
                        Owes ${Math.abs(member.balance).toFixed(2)}
                      </>
                    ) : (
                      "Settled"
                    )}
                  </div>
                </div>
              </div>
            </div>

            <MemberActions 
              groupId={groupId} 
              member={member} 
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              onUpdate={refetch}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
