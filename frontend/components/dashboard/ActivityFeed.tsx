"use client";
import { Card, CardLabel } from "@/components/ui/Card";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "@/lib/time";

export function ActivityFeed() {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardLabel>Activity</CardLabel>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[0.65rem] text-ember hover:text-gold transition-colors">
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-faint">
          <Bell size={24} />
          <p className="text-xs">No activity yet</p>
        </div>
      )}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              n.read ? "border-white/[0.04] opacity-60" : "border-ember/20 bg-ember/5"
            }`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-text">{n.title}</p>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0 mt-1" />}
            </div>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.body}</p>
            <p className="text-[0.6rem] text-faint mt-1">{formatDistanceToNow(n.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
