"use client";
import { useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types";
import { formatDistanceToNow } from "@/lib/time";
import { Bell, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const TYPE_COLORS: Record<string, string> = {
  MERGE_REQUEST:    "text-gold",
  MERGE_FINALISED:  "text-spark",
  MERGE_DECLINED:   "text-red-400",
  LEVEL_UP:         "text-cyan",
  MESSAGE_RECEIVED: "text-ember",
  SYSTEM:           "text-muted",
};

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={onClose} />

      {/* Drawer */}
      <div ref={ref} className={cn(
        "fixed top-0 right-0 z-50 h-full w-80 bg-surface border-l border-white/[0.07]",
        "flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-ember" />
            <span className="text-sm font-semibold text-text">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[0.6rem] bg-ember text-bg font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-[0.65rem] text-muted hover:text-text transition-colors flex items-center gap-1">
                <CheckCheck size={11} /> All read
              </button>
            )}
            <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <Bell size={28} className="text-faint" />
              <p className="text-xs text-faint">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n: Notification) => (
              <button key={n.id} onClick={() => markRead(n.id)}
                className={cn(
                  "w-full text-left px-5 py-4 border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]",
                  !n.read && "bg-ember/[0.04]"
                )}>
                <div className="flex items-start gap-3">
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0 mt-1.5" />}
                  {n.read  && <span className="w-1.5 h-1.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-semibold mb-0.5", TYPE_COLORS[n.type] ?? "text-text")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">{n.body}</p>
                    <p className="text-[0.6rem] text-faint mt-1">{formatDistanceToNow(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}