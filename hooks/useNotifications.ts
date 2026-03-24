"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { apiClient } from "@/lib/api-client";
import { Notification } from "@/lib/validations";

export function useNotifications() {
  const { authenticated, ready, getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    if (!authenticated) return [];

    const token = await getAccessToken();
    if (!token) return [];

    apiClient.setToken(token);
    return apiClient.notifications.list();
  }, [authenticated, getAccessToken]);

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: ready,
    refetchInterval: authenticated ? 30000 : false,
    refetchOnWindowFocus: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessToken();
      if (!token) return;

      apiClient.setToken(token);
      await apiClient.notifications.markAsRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      if (!token) return;

      apiClient.setToken(token);
      await apiClient.notifications.markAllAsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error instanceof Error ? notificationsQuery.error.message : null,
    markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    refresh: () => notificationsQuery.refetch(),
  };
}
