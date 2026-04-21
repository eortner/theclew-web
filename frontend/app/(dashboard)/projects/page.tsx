"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Project, LEVEL_META } from "@/types";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Eye, EyeOff, Share2, Plus, Globe, Search } from "lucide-react";
import { cn } from "@/lib/cn";

const visibilityIcon  = { PRIVATE: EyeOff, SELECTIVE: Share2, PUBLIC: Eye };
const visibilityColor = { PRIVATE: "border-ember/30 text-ember", SELECTIVE: "border-gold/30 text-gold", PUBLIC: "border-spark/30 text-spark" };

type Tab = "mine" | "discover";

export default function ProjectsPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("mine");
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Project[]>("/projects"),
      api.get<Project[]>("/projects/public"),
    ]).then(([mine, pub]) => {
      setMyProjects(mine);
      setPublicProjects(pub);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = (tab === "mine" ? myProjects : publicProjects).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Projects</p>
          <h1 className="font-display text-4xl font-black fire-text">PROJECTS</h1>
        </div>
        <Link href="/projects/new">
          <Button variant="primary" size="sm">
            <Plus size={14} className="mr-1" /> New project
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface border border-white/[0.07] rounded-xl p-1 w-fit">
        {([["mine", "My Projects"], ["discover", "Discover"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === t ? "bg-ember text-bg" : "text-muted hover:text-text")}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          className="w-full bg-surface border border-white/[0.07] text-text rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-ember/50 placeholder:text-faint"
          placeholder="Search by name or tag…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="text-muted text-sm animate-pulse">Loading…</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-faint">
          {tab === "mine" ? (
            <div className="space-y-3">
              <p className="text-lg font-display">No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
              <Link href="/projects/new"><Button variant="primary" size="sm">Create project</Button></Link>
            </div>
          ) : (
            <p className="text-sm">No public projects found</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => {
          const meta = LEVEL_META[p.currentLevel];
          const VisIcon = visibilityIcon[p.visibility];
          const isOwn = p.owners.some(o => o.userId === user?.id);
          return (
            <Link key={p.id} href={`/projects/${p.id}`}
              className="group bg-surface border border-white/[0.07] rounded-xl p-5 hover:border-ember/30 transition-all duration-200 block">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Level fire indicator */}
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                    <h3 className="font-display text-lg font-bold text-text truncate group-hover:text-ember transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  {p.tagline && <p className="text-xs text-gold mb-1 truncate">{p.tagline}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <Badge className={visibilityColor[p.visibility]}>
                    <VisIcon size={9} className="mr-1" />{p.visibility}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">{p.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[0.6rem] px-2 py-0.5 rounded-full bg-ember/10 text-ember border border-ember/20">
                      {t}
                    </span>
                  ))}
                  {p.tags.length > 3 && <span className="text-[0.6rem] text-faint">+{p.tags.length - 3}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-faint">
                  {p.monthlyRevenue != null && p.monthlyRevenue > 0 && (
                    <span className="text-spark font-semibold">${p.monthlyRevenue.toLocaleString()}/mo</span>
                  )}
                  <span style={{ color: meta.color }}>{meta.name}</span>
                </div>
              </div>

              {!isOwn && tab === "discover" && (
                <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2">
                  <Globe size={10} className="text-faint" />
                  <span className="text-[0.65rem] text-faint">{p.owners.find(o => o.role === 'FOUNDER')?.user.name}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}