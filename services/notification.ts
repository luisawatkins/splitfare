import { supabaseAdmin } from "@/supabase/admin";
import { Notification, NotificationTypeEnum } from "@/lib/validations";
import { z } from "zod";

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export interface NotificationData {
  groupId?: string;
  expenseId?: string;
  settlementId?: string;
  senderId?: string;
  senderName?: string;
  groupName?: string;
  amount?: number;
  currency?: string;
  [key: string]: any;
}

export const notificationService = {
  async createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
  }) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data as Notification;
  },

  async getUserNotifications(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data as Notification[];
  },

  async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async getLatestNudge(senderId: string, receiverId: string, groupId: string) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('created_at')
      .eq('user_id', receiverId)
      .eq('type', 'payment_reminder')
      .eq('data->>senderId', senderId)
      .eq('data->>groupId', groupId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest nudge:', error);
      return null;
    }

    return data ? new Date(data.created_at) : null;
  },
};
