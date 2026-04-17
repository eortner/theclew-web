"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Project } from "@/types";
import { LEVEL_META } from "@/types";
import { EquityBar } from "@/components/dashboard/EquityBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Eye, EyeOff, Share2, ArrowLeft } from "lucide-react";

const visibilityIcon = { PRIVATE: EyeOff, SELECTIVE: Share2, PUBLIC: Eye };
const visibilityColor = { PRIVATE: "border-ember/30 text-ember", SELECTIVE: "border-gold/30 text-gold", PUBLIC: "border-spark/30 text-spark" };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Project>(`/projects/${id}`)
      .then(setProject)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-muted animate-pulse text-sm">Loading…</div>;
  if (error || !project) return <div className="text-red-400 text-sm">{error || "Project not found"}</div>;

  const levelMeta = LEVEL_META[project.currentLevel];
  const VisIcon = visibilityIcon[project.visibility];

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-xs text-muted hover:text-text mb-6 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Project</p>
          <h1 className="font-display text-4xl font-black fire-text">{project.name.toUpperCase()}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={visibilityColor[project.visibility]}>
            <VisIcon size={10} className="mr-1" />{project.visibility}
          </Badge>
          <Badge className="border-white/20 text-muted" style={{ borderColor: levelMeta.color, color: levelMeta.color }}>
            Level {project.currentLevel} — {levelMeta.name}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-3">About</p>
            <p className="text-sm text-muted leading-relaxed">{project.description}</p>
          </div>

          {/* Tags */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-3">Tags</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map(t => (
                <span key={t} className="text-xs text-muted bg-white/5 border border-white/[0.07] px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
            <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-2">Metatags</p>
            <div className="flex flex-wrap gap-2">
              {project.metatags.map(t => (
                <span key={t} className="text-xs text-ember bg-ember/10 border border-ember/20 px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* Level history */}
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-3">Level history</p>
            <div className="space-y-2">
              {project.levelHistory.map((h) => (
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
        </div>

        <div className="space-y-6">
          <EquityBar />
          <div className="bg-surface border border-white/[0.07] rounded-xl p-6">
            <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-3">Actions</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Share2 size={14} /> Propose merge
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted">
                <Eye size={14} /> Change visibility
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
