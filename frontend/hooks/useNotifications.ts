"use client";
import useSWR from "swr";
import { api } from "@/lib/api";
import { Notification } from "@/types";

interface NotifResponse {
  data: Notification[];
  meta: { total: number; unreadCount: number };
}

export function useNotifications() {
  const { data, mutate } = useSWR<NotifResponse>(
    "/notifications?limit=20",
    () => api.get("/notifications?limit=20"),
    { refreshInterval: 30000 }
  );

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`, {});
    mutate();
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all", {});
    mutate();
  }

  return { notifications: data?.data ?? [], unreadCount: data?.meta.unreadCount ?? 0, markRead, markAllRead };
}
