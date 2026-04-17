"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Thread } from "@/types";
import Link from "next/link";
import { MessageSquare, GitMerge, Building, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "@/lib/time";

const typeIcon = { MERGE: GitMerge, ACQUISITION: Building, VISIBILITY_SHARE: Eye, GENERAL: MessageSquare };
const typeColor = { MERGE: "text-spark", ACQUISITION: "text-cyan", VISIBILITY_SHARE: "text-gold", GENERAL: "text-muted" };

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Thread[]>("/threads").then(setThreads).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Inbox</p>
          <h1 className="font-display text-4xl font-black fire-text">MESSAGES</h1>
        </div>
      </div>

      {loading && <p className="text-muted text-sm animate-pulse">Loading…</p>}
      {!loading && threads.length === 0 && (
        <div className="bg-surface border border-white/[0.07] rounded-xl p-12 text-center">
          <MessageSquare size={32} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">No conversations yet</p>
          <p className="text-xs text-faint mt-1">Merge proposals, messages and acquisition offers will appear here</p>
        </div>
      )}

      <div className="space-y-3">
        {threads.map(t => {
          const Icon = typeIcon[t.type as keyof typeof typeIcon] ?? MessageSquare;
          const col = typeColor[t.type as keyof typeof typeColor] ?? "text-muted";
          return (
            <Link key={t.id} href={`/threads/${t.id}`}
              className="flex items-start gap-4 p-4 bg-surface border border-white/[0.07] rounded-xl hover:border-ember/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className={col} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text group-hover:text-ember transition-colors truncate">{t.subject}</p>
                  <span className="text-[0.6rem] text-faint flex-shrink-0">{formatDistanceToNow(t.updatedAt)}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {t.initiator.name} → {t.recipient.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[0.6rem] uppercase font-bold ${col}`}>{t.type.replace("_"," ")}</span>
                  <span className="text-[0.6rem] text-faint">{t._count.messages} messages</span>
                  <span className={`text-[0.6rem] uppercase font-bold ${t.status === "FINALISED" ? "text-spark" : t.status === "DECLINED" ? "text-red-400" : "text-faint"}`}>{t.status.replace("_"," ")}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
