"use client";

import { Notification } from "@/lib/validations";
import { cn } from "@/lib/cn";
import { formatDistanceToNow } from "date-fns";
import { 
  Receipt, 
  HandCoins, 
  UserPlus, 
  BellRing, 
  WalletCards,
  Group
} from "lucide-react";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'expense_added':
        return <Receipt className="h-5 w-5 text-blue-500" />;
      case 'settlement_sent':
      case 'settlement_received':
        return <HandCoins className="h-5 w-5 text-green-500" />;
      case 'payment_reminder':
        return <BellRing className="h-5 w-5 text-orange-500" />;
      case 'group_invite':
      case 'member_joined':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLink = () => {
    const data = notification.data;
    if (data.groupId) {
      if (data.expenseId) {
        return `/groups/${data.groupId}/expenses/${data.expenseId}`;
      }
      return `/groups/${data.groupId}`;
    }
    return "#";
  };

  return (
    <div
      className={cn(
        "relative flex gap-4 p-4 transition-colors hover:bg-muted/50",
        !notification.is_read && "bg-muted/20"
      )}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div className="mt-1 flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <Link href={getLink()} className="block">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-sm font-medium leading-none",
              !notification.is_read && "font-bold"
            )}>
              {notification.title}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
        </Link>
      </div>
      {!notification.is_read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
      )}
    </div>
  );
}
