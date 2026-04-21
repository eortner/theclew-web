"use client";
import { useUser } from "@/hooks/useUser";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { SlackCard } from "@/components/dashboard/SlackCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AnnouncementBanner } from "@/components/dashboard/AnnouncementBanner";
import { BetaBanner } from "@/components/dashboard/BetaBanner";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Lock, Eye, Globe, ShieldOff } from "lucide-react";
import { Project, LEVEL_META } from "@/types";
import { cn } from "@/lib/cn";

const VISIBILITY_META = {
  PRIVATE:   { label: "Private",   icon: Lock,  color: "text-faint" },
  SELECTIVE: { label: "Selective", icon: Eye,   color: "text-gold"  },
  PUBLIC:    { label: "Public",    icon: Globe, color: "text-spark" },
};

function ProjectCard({ project, myEquity }: { project: Project; myEquity: number }) {
  const level = LEVEL_META[project.currentLevel];
  const vis   = VISIBILITY_META[project.visibility];
  const VisIcon = vis.icon;

  return (
    <Link href={`/projects/${project.id}`}
      className="group p-5 bg-surface-2 border border-white/[0.07] rounded-xl hover:border-ember/30 transition-all duration-200 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text group-hover:text-ember transition-colors truncate leading-snug">
          {project.name}
        </p>
        {/* Level badge — animated glow on level 0 */}
        <span className={cn(
          "flex-shrink-0 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border",
          project.currentLevel === 0 && "animate-pulse"
        )} style={{
          color:            level.color,
          borderColor:      `${level.color}40`,
          backgroundColor:  `${level.color}15`,
        }}>
          {level.name.toUpperCase()}
        </span>
      </div>

      {/* Visibility */}
      <div className={cn("flex items-center gap-1.5 text-[0.65rem]", vis.color)}>
        <VisIcon size={11} />
        <span>{vis.label}</span>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag}
              className="text-[0.6rem] text-faint border border-white/[0.07] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-[0.6rem] text-faint">+{project.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Equity row */}
      <div className="mt-auto pt-3 border-t border-white/[0.04]">
        <div className="flex items-center justify-between text-[0.6rem] text-faint mb-1.5">
          <span>Equity</span>
          <span>Emoclew {100 - myEquity}% · You {myEquity}%</span>
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
          <div className="bg-cyan h-full transition-all" style={{ width: `${100 - myEquity}%` }} />
          <div className="h-full transition-all" style={{ width: `${myEquity}%`, background: level.color }} />
        </div>
      </div>
    </Link>
  );
}

function TotpNudge() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
      <ShieldOff size={18} className="text-amber-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-300">2FA not enabled</p>
        <p className="text-[0.65rem] text-muted mt-0.5">
          Enable two-factor authentication to make projects discoverable and unlock merge actions.
        </p>
      </div>
      <Link href="/settings/totp">
        <Button variant="outline" size="sm" className="flex-shrink-0 text-amber-300 border-amber-500/30 hover:bg-amber-500/10">
          Enable
        </Button>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  if (!user) return null;

  const u        = user as any;
  const ownerships = u.ownerships ?? [];
  const projects: Project[] = ownerships.map((o: any) => o.project);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Announcement banner */}
      <BetaBanner />
      <AnnouncementBanner />

      {/* Header */}
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

      {/* TOTP nudge if not enabled */}
      {!u.totpEnabled && <TotpNudge />}

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RevenueCard projects={projects} />
        <SlackCard />
      </div>

      {/* Projects — per-project cards with level, visibility, equity */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-widest text-ember">Your projects</p>
          {projects.length > 3 && (
            <Link href="/projects" className="text-xs text-muted hover:text-gold transition-colors">
              View all →
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/[0.07] rounded-xl">
            <p className="text-sm text-muted mb-3">No projects yet</p>
            <Link href="/projects/new">
              <Button variant="outline" size="sm">
                <Plus size={14} className="mr-1.5" /> Create your first project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerships.slice(0, 6).map((o: any) => (
              <ProjectCard key={o.project.id} project={o.project} myEquity={o.equityPercent} />
            ))}
          </div>
        )}
      </div>

      {/* Activity */}
      <ActivityFeed />
    </div>
  );
}