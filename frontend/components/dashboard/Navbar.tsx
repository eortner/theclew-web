"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, LogOut } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDrawer } from "./NotificationDrawer";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";

export function Navbar({ userName, avatarUrl }: { userName: string; avatarUrl?: string }) {
  const { unreadCount }       = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    try { await api.post("/auth/logout", {}); } catch {}
    router.push("/login");
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface/90 backdrop-blur border-b border-white/[0.07] flex items-center justify-between px-6">
        <Link href="/dashboard" className="font-display text-xl font-bold fire-text tracking-wide">EMOCLEW</Link>
        <div className="flex items-center gap-3">
          <Link href="/threads"
            className="relative p-2 text-muted hover:text-text transition-colors rounded-lg hover:bg-white/5">
            <MessageSquare size={18} />
          </Link>

          {/* Bell — opens drawer */}
          <button onClick={() => setDrawerOpen(true)}
            className="relative p-2 text-muted hover:text-text transition-colors rounded-lg hover:bg-white/5">
            <Bell size={18} className={unreadCount > 0 ? "text-ember" : ""} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-ember text-bg text-[0.6rem] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <Avatar name={userName} src={avatarUrl} size={8} />
          <button onClick={logout}
            className="p-2 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}