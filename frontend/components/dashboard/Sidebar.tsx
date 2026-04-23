"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, MessageSquare, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard",     label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects",      label: "Projects",  icon: FolderOpen },
  { href: "/threads",       label: "Messages",  icon: MessageSquare },
  { href: "/library",       label: "Library",   icon: BookOpen },
  { href: "/settings/totp", label: "Settings",  icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-surface border-r border-white/[0.07] flex flex-col py-6 px-3">
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              path.startsWith(href) && href !== "/dashboard"
                ? "bg-ember/10 text-ember"
                : path === href
                ? "bg-ember/10 text-ember"
                : "text-muted hover:text-text hover:bg-white/5"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}