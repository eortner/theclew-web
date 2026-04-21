"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Project, LEVEL_META, TAG_CATEGORY_LABELS, platformEquityForLevel } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUser } from "@/hooks/useUser";
import { Eye, EyeOff, Share2, ArrowLeft, ExternalLink, Users, TrendingUp, GitMerge, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";

const CATEGORY_ORDER = ["domain", "tech", "model", "stage", "geo"];
const visibilityIcon  = { PRIVATE: EyeOff, SELECTIVE: Share2, PUBLIC: Eye };
const visibilityColor = { PRIVATE: "border-ember/30 text-ember", SELECTIVE: "border-gold/30 text-gold", PUBLIC: "border-spark/30 text-spark" };

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE",   label: "Private",   desc: "Hidden but discoverable by tags" },
  { value: "SELECTIVE", label: "Selective", desc: "Share details on request" },
  { value: "PUBLIC",    label: "Public",    desc: "Fully visible to the community" },
];

export default function ProjectDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user } = useUser();
  const [project, setProject]             = useState<Project | null>(null);
  const [similar, setSimilar]             = useState<Project[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [changingVisibility, setChangingVisibility] = useState(false);
  const [visibilityLoading, setVisibilityLoading]   = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Project>(`/projects/${id}`),
      api.get<Project[]>(`/projects/${id}/similar`).catch(() => []),
    ]).then(([p, sim]) => {
      setProject(p);
      setSimilar(sim);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function changeVisibility(visibility: string) {
    if (!project) return;
    setVisibilityLoading(true);
    try {
      const updated = await api.patch<Project>(`/projects/${id}`, { visibility });
      setProject(updated);
      setChangingVisibility(false);
    } catch (e: any) {
      if (e.message?.includes('totpRequired') || e.message?.includes('Two-factor')) {
        router.push('/settings/totp');
      }
    } finally { setVisibilityLoading(false); }
  }

  if (loading) return <div className="text-muted animate-pulse text-sm">Loading…</div>;
  if (error || !project) return <div className="text-red-400 text-sm">{error || "Project not found"}</div>;

  const levelMeta  = LEVEL_META[project.currentLevel];
  const VisIcon    = visibilityIcon[project.visibility];
  const isOwner = project.owners.some(o => o.userId === user?.id && o.role === 'FOUNDER');
  const isInvolved = project.owners.some(o => o.userId === user?.id);
  const platformPct = platformEquityForLevel(project.currentLevel);

  const tagsByCategory = project.projectTags.reduce<Record<string, typeof project.projectTags>>(
    (acc, pt) => { const cat = pt.tag.category ?? "other"; if (!acc[cat]) acc[cat] = []; acc[cat].push(pt); return acc; }, {}
  );

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-xs text-muted hover:text-text mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Project</p>
          <div className="flex items-center gap-3 mb-1">
            {/* Fire level indicator */}
            <div className="relative">
              <div className="w-3 h-3 rounded-full" style={{
                background: levelMeta.color,
                boxShadow: `0 0 8px ${levelMeta.color}, 0 0 20px ${levelMeta.color}50`
              }} />
            </div>
            <h1 className="font-display text-4xl font-black fire-text">{project.name.toUpperCase()}</h1>
          </div>
          {project.tagline && <p className="text-sm text-gold ml-6">{project.tagline}</p>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={visibilityColor[project.visibility]}>
            <VisIcon size={10} className="mr-1" />{project.visibility}
          </Badge>
          <Badge className="border-white/20 text-muted"
            style={{ borderColor: levelMeta.color, color: levelMeta.color }}>
            Level {project.currentLevel} — {levelMeta.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-3">About</p>
            <p className="text-sm text-muted leading-relaxed">{project.description}</p>
            {project.website && (
              <a href={project.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-xs text-gold hover:text-spark transition-colors border border-gold/20 hover:border-spark/30 rounded-full px-3 py-1.5">
                <ExternalLink size={11} />
                {project.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Stats */}
          {(project.monthlyRevenue != null || project.teamSize != null) && (
            <div className="grid grid-cols-2 gap-4">
              {project.monthlyRevenue != null && project.monthlyRevenue > 0 && (
                <div className="bg-surface border border-white/[0.07] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-spark" />
                    <p className="text-[0.65rem] uppercase tracking-widest text-faint">Monthly Revenue</p>
                  </div>
                  <p className="font-display text-2xl font-bold text-spark">${project.monthlyRevenue.toLocaleString()}</p>
                </div>
              )}
              {project.teamSize != null && (
                <div className="bg-surface border border-white/[0.07] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-cyan" />
                    <p className="text-[0.65rem] uppercase tracking-widest text-faint">Team Size</p>
                  </div>
                  <p className="font-display text-2xl font-bold text-cyan">{project.teamSize}</p>
                </div>
              )}
            </div>
          )}

          {/* Ownership */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-4">Equity Structure</p>
            <div className="space-y-3">
              {/* Platform */}
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-cyan" />
                  <span className="text-xs text-muted">Emoclew Platform</span>
                </div>
                <span className="text-xs font-semibold text-cyan">{platformPct}%</span>
              </div>
              {/* Founders */}
              {project.owners.map(o => (
                <div key={o.userId} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm bg-ember" />
                    <span className="text-xs text-muted">{o.user.name}</span>
                    {o.role === 'MERGED_FOUNDER' && <span className="text-[0.6rem] text-faint">(merged)</span>}
                  </div>
                  <span className="text-xs font-semibold text-ember">{o.equityPercent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-4">Tags</p>
            <div className="space-y-4">
              {CATEGORY_ORDER.map(cat => {
                const entries = tagsByCategory[cat];
                if (!entries?.length) return null;
                return (
                  <div key={cat}>
                    <p className="text-[0.6rem] uppercase tracking-widest text-faint mb-2">
                      {TAG_CATEGORY_LABELS[cat] ?? cat}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entries.map(({ tag }) => (
                        <span key={tag.id} className="text-xs px-3 py-1 rounded-full border bg-ember/10 border-ember/20 text-ember">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level history */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-3">Level History</p>
            <div className="space-y-2">
              {project.levelHistory.map(h => (
                <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: LEVEL_META[h.level].color }} />
                    <span className="text-xs text-text font-medium">Level {h.level} — {LEVEL_META[h.level].name}</span>
                  </div>
                  <span className="text-xs text-faint">{new Date(h.achievedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar projects */}
          {similar.length > 0 && (
            <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
              <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-4">Similar Projects</p>
              <div className="space-y-3">
                {similar.map(s => (
                  <Link key={s.id} href={`/projects/${s.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/[0.04] hover:border-ember/20 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-text">{s.name}</p>
                      <p className="text-[0.65rem] text-faint">{s.tags.slice(0, 3).join(', ')}</p>
                    </div>
                    <span className="text-[0.65rem]" style={{ color: LEVEL_META[s.currentLevel].color }}>
                      {LEVEL_META[s.currentLevel].name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Level card */}
          <div className="bg-surface border rounded-xl p-6" style={{ borderColor: `${levelMeta.color}40` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg"
                style={{ background: `${levelMeta.color}20`, color: levelMeta.color, boxShadow: `0 0 16px ${levelMeta.color}40` }}>
                {project.currentLevel}
              </div>
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider" style={{ color: levelMeta.color }}>
                  {levelMeta.name}
                </p>
                <p className="text-[0.65rem] text-faint">{levelMeta.fee}</p>
              </div>
            </div>
            <p className="text-[0.65rem] text-muted leading-relaxed">{levelMeta.unlocks}</p>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
              <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-4">Actions</p>
              <div className="space-y-2">
                {/* Visibility selector */}
                {!changingVisibility ? (
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted"
                    onClick={() => setChangingVisibility(true)}>
                    <VisIcon size={14} /> Change visibility
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted mb-2">Select visibility:</p>
                    {VISIBILITY_OPTIONS.map(opt => (
                      <button key={opt.value}
                        onClick={() => changeVisibility(opt.value)}
                        disabled={visibilityLoading}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors",
                          project.visibility === opt.value
                            ? "border-ember/40 bg-ember/10 text-ember"
                            : "border-white/[0.07] text-muted hover:border-ember/20"
                        )}>
                        <span className="font-semibold">{opt.label}</span>
                        <span className="block text-faint text-[0.6rem]">{opt.desc}</span>
                      </button>
                    ))}
                    <button onClick={() => setChangingVisibility(false)}
                      className="text-xs text-faint hover:text-muted transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Propose merge — only for other people's projects */}
          {!isInvolved && (
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-4">Connect</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2"
                onClick={() => router.push(`/threads?compose=true&recipientId=${project.owners.find(o => o.role === 'FOUNDER')?.userId}&recipientName=${encodeURIComponent(project.owners.find(o => o.role === 'FOUNDER')?.user.name ?? '')}&subject=${encodeURIComponent(`Re: ${project.name}`)}`)}>
                <MessageSquare size={14} /> Message founder
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2"
                onClick={() => router.push(`/threads?compose=true&type=MERGE&recipientId=${project.owners.find(o => o.role === 'FOUNDER')?.userId}&recipientName=${encodeURIComponent(project.owners.find(o => o.role === 'FOUNDER')?.user.name ?? '')}&subject=${encodeURIComponent(`Merge proposal: ${project.name}`)}&recipientProjectId=${project.id}`)}>
                <GitMerge size={14} /> Propose merge
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}