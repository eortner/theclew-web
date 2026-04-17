"use client";
import { useUser } from "@/hooks/useUser";
import { LevelCard } from "@/components/dashboard/LevelCard";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { EquityBar } from "@/components/dashboard/EquityBar";
import { SlackCard } from "@/components/dashboard/SlackCard";
import { VisibilityCard } from "@/components/dashboard/VisibilityCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Project } from "@/types";

export default function DashboardPage() {
  const { user } = useUser();
  if (!user) return null;
  const u = user as any;
  const projects: Project[] = (user as any).projects ?? [];
  const topLevel = projects.reduce((max: number, p: Project) => Math.max(max, p.currentLevel), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Welcome back</p>
          <h1 className="font-display text-4xl font-black fire-text">{u.name.toUpperCase()}</h1>
        </div>
        <Link href="/projects/new">
          <Button variant="primary" size="md">
            <Plus size={16} className="mr-2" /> New project
          </Button>
        </Link>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LevelCard level={topLevel} />
        <RevenueCard projects={projects} />
        <SlackCard />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <EquityBar />
        <VisibilityCard />
      </div>

      {/* Projects preview */}
      {projects.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-ember">Your projects</p>
            <Link href="/projects" className="text-xs text-muted hover:text-gold transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((p: Project) => (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="p-4 bg-surface border border-white/[0.07] rounded-xl hover:border-ember/30 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-text group-hover:text-ember transition-colors truncate">{p.name}</p>
                  <span className="text-[0.6rem] text-faint border border-white/[0.07] px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                    L{p.currentLevel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      <ActivityFeed />
    </div>
  );
}
