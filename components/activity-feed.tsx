"use client";

import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Receipt, Wallet, UserPlus, Info, Clock } from "lucide-react";
import { cn } from "@/lib/cn";

type ActivityItem = {
  id: string;
  type: "expense" | "settlement" | "join" | "system";
  content: string;
  timestamp: string;
  user: {
    name: string;
    avatar_url: string | null;
  };
  amount?: number;
  currency?: string;
};

type ActivityFeedProps = {
  activities: ActivityItem[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">Recent Activity</h3>
        <Card className="p-8 text-center border-dashed bg-muted/30 rounded-3xl">
          <p className="text-sm text-muted-foreground font-medium italic">No activities yet. Start by adding an expense!</p>
        </Card>
      </div>
    );
  }

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "expense": return <Receipt size={14} className="text-rose-500" />;
      case "settlement": return <Wallet size={14} className="text-emerald-500" />;
      case "join": return <UserPlus size={14} className="text-blue-500" />;
      default: return <Info size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 px-1">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4 flex items-center gap-4 border-border/50 bg-card/50 hover:bg-muted/30 transition-all duration-300 rounded-2xl group shadow-sm hover:shadow-md">
            <div className="relative">
              <Avatar 
                src={activity.user.avatar_url || undefined} 
                fallback={activity.user.name.slice(0, 2).toUpperCase()} 
                className="h-10 w-10 border-2 border-border/50 group-hover:border-primary/50 transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border shadow-sm">
                {getIcon(activity.type)}
              </div>
            </div>

            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-bold tracking-tight text-foreground/90 leading-tight">
                {activity.content}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
                {activity.amount && (
                  <>
                    <span className="text-[10px] opacity-40">•</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-4 font-black bg-slate-100 dark:bg-slate-800 border-none">
                      {activity.currency} {activity.amount.toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
