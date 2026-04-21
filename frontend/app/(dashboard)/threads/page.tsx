"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Thread } from "@/types";
import Link from "next/link";
import { MessageSquare, GitMerge, Building, Eye, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDistanceToNow } from "@/lib/time";

const typeIcon  = { MERGE: GitMerge, ACQUISITION: Building, VISIBILITY_SHARE: Eye, GENERAL: MessageSquare };
const typeColor = { MERGE: "text-spark", ACQUISITION: "text-cyan", VISIBILITY_SHARE: "text-gold", GENERAL: "text-muted" };

export default function ThreadsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [threads, setThreads]   = useState<Thread[]>([]);
  const [loading, setLoading]   = useState(true);
  const [composing, setComposing] = useState(false);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    recipientId: "", recipientName: "", subject: "", message: "", type: "GENERAL", recipientProjectId: "",
  });

  useEffect(() => {
    api.get<Thread[]>("/threads").then(setThreads).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("compose") === "true") {
      setForm(f => ({
        ...f,
        recipientId:        searchParams.get("recipientId") ?? "",
        recipientName:      searchParams.get("recipientName") ?? "",
        subject:            searchParams.get("subject") ?? "",
        type:               searchParams.get("type") ?? "GENERAL",
        recipientProjectId: searchParams.get("recipientProjectId") ?? "",
      }));
      setComposing(true);
    }
  }, [searchParams]);

  async function startThread(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSending(true);
    try {
      const thread = await api.post<{ id: string }>("/threads", {
        recipientId:        form.recipientId,
        type:               form.type,
        subject:            form.subject,
        ...(form.recipientProjectId && { recipientProjectId: form.recipientProjectId }),
      });
      if (form.message.trim()) {
        await api.post(`/threads/${thread.id}/messages`, { body: form.message });
      }
      router.push(`/threads/${thread.id}`);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally { setSending(false); }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-ember mb-1">Inbox</p>
          <h1 className="font-display text-4xl font-black fire-text">MESSAGES</h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setComposing(true)}>
          <Plus size={14} className="mr-1" /> New message
        </Button>
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/[0.07] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-black text-text">
                {form.type === "MERGE" ? "PROPOSE MERGE" : "NEW MESSAGE"}
              </h2>
              <button onClick={() => { setComposing(false); setError(""); }}
                className="text-faint hover:text-text transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={startThread} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">To</label>
                <p className="text-sm text-text font-semibold">{form.recipientName || "—"}</p>
              </div>
              <Input label="Subject" required value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="What's this about?" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">Message</label>
                <textarea
                  className="w-full bg-bg border border-white/[0.07] text-text rounded-lg px-4 py-2.5 text-sm outline-none focus:border-ember/50 min-h-[100px] resize-y placeholder:text-faint"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your message…" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => { setComposing(false); setError(""); }}>Cancel</Button>
                <Button type="submit" variant="primary" loading={sending}>Send</Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          const col  = typeColor[t.type as keyof typeof typeColor] ?? "text-muted";
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
                <p className="text-xs text-muted mt-0.5">{t.initiator.name} → {t.recipient.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[0.6rem] uppercase font-bold ${col}`}>{t.type.replace("_", " ")}</span>
                  <span className="text-[0.6rem] text-faint">{t._count.messages} messages</span>
                  <span className={`text-[0.6rem] uppercase font-bold ${t.status === "FINALISED" ? "text-spark" : t.status === "DECLINED" ? "text-red-400" : "text-faint"}`}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}