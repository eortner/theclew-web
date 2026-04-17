"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Thread, Message } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EquityBar } from "@/components/dashboard/EquityBar";
import { formatDistanceToNow } from "@/lib/time";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [thread, setThread] = useState<Thread & { messages: Message[] } | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [mergeStep, setMergeStep] = useState<"equity"|"reauth"|"confirm"|null>(null);
  const [proposedEquity, setProposedEquity] = useState(42.5);
  const [password, setPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const t = await api.get<Thread & { messages: Message[] }>(`/threads/${id}`);
    setThread(t);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  useEffect(() => { load(); }, [id]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      await api.post(`/threads/${id}/messages`, { body });
      setBody(""); load();
    } finally { setSending(false); }
  }

  async function proposeEquity() {
    setMergeLoading(true); setMergeError("");
    try {
      await api.patch(`/merge/${id}/equity`, { proposedEquity });
      setMergeStep("reauth"); load();
    } catch (e: any) { setMergeError(e.message); }
    finally { setMergeLoading(false); }
  }

  async function reAuth() {
    setMergeLoading(true); setMergeError("");
    try {
      await api.post(`/merge/${id}/reauth`, { password: password || undefined, confirmPhrase: confirmPhrase || undefined });
      setMergeStep("confirm"); load();
    } catch (e: any) { setMergeError(e.message); }
    finally { setMergeLoading(false); }
  }

  async function confirmMerge() {
    setMergeLoading(true); setMergeError("");
    try {
      await api.post(`/merge/${id}/confirm`, { understood: true });
      setMergeStep(null); load();
    } catch (e: any) { setMergeError(e.message); }
    finally { setMergeLoading(false); }
  }

  async function declineMerge() {
    if (!confirm("Are you sure you want to decline this merge?")) return;
    await api.post(`/merge/${id}/decline`, {});
    load();
  }

  if (!thread) return <div className="text-muted text-sm animate-pulse">Loading…</div>;
  const isMerge = ["MERGE","ACQUISITION"].includes(thread.type);
  const closed = ["FINALISED","DECLINED","EXPIRED"].includes(thread.status);

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/threads" className="text-muted hover:text-text transition-colors"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-text">{thread.subject}</h1>
          <p className="text-xs text-muted">{thread.initiator.name} · {thread.recipient.name} · {thread.status.replace(/_/g," ")}</p>
        </div>
        {isMerge && !closed && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMergeStep("equity")}>Merge flow</Button>
            <Button variant="danger" size="sm" onClick={declineMerge}>Decline</Button>
          </div>
        )}
      </div>

      {/* Equity bar for merge threads */}
      {isMerge && (
        <div className="mb-4">
          <EquityBar interactive={mergeStep === "equity"} onPropose={setProposedEquity} />
        </div>
      )}

      {/* Merge flow panel */}
      {mergeStep && (
        <div className="bg-surface border border-ember/30 rounded-xl p-6 mb-4 space-y-4">
          {mergeStep === "equity" && (
            <>
              <p className="text-sm font-semibold text-text">Step 1 — Propose equity split</p>
              <p className="text-xs text-muted">Use the bar above to set your proposed share. Emoclew always retains 15%.</p>
              <p className="text-xs text-spark">Your proposal: {proposedEquity}%</p>
              {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
              <Button variant="primary" size="sm" loading={mergeLoading} onClick={proposeEquity}>Submit proposal</Button>
            </>
          )}
          {mergeStep === "reauth" && (
            <>
              <p className="text-sm font-semibold text-text">Step 2 — Re-authenticate</p>
              <p className="text-xs text-muted">Confirm your identity before proceeding. Local accounts enter password; Google/Facebook accounts type their email and the phrase below.</p>
              <Input label="Password (local accounts)" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <Input label="Email (OAuth accounts)" type="email" value={confirmPhrase} onChange={e => setConfirmPhrase(e.target.value)} />
              <Input label='Confirm phrase — type: "I confirm this merge"' value={confirmPhrase} onChange={e => setConfirmPhrase(e.target.value)} />
              {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
              <Button variant="primary" size="sm" loading={mergeLoading} onClick={reAuth}>Verify identity</Button>
            </>
          )}
          {mergeStep === "confirm" && (
            <>
              <p className="text-sm font-semibold text-spark">Step 3 — Final confirmation</p>
              <p className="text-xs text-muted leading-relaxed">This action is <strong className="text-text">irreversible</strong>. Once both parties confirm, the merge is final. Projects will be merged at the higher of the two levels.</p>
              {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
              <Button variant="primary" size="sm" loading={mergeLoading} onClick={confirmMerge}>I understand — confirm merge</Button>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {thread.messages.map(m => (
          <div key={m.id} className="flex items-start gap-3">
            <Avatar name={m.author.name} src={m.author.avatarUrl} size={8} />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-text">{m.author.name}</span>
                <span className="text-[0.6rem] text-faint">{formatDistanceToNow(m.createdAt)}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed mt-0.5">{m.body}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Send */}
      {!closed && (
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            className="flex-1 bg-surface border border-white/[0.07] text-text rounded-full px-5 py-2.5 text-sm outline-none focus:border-ember/50 placeholder:text-faint"
            placeholder="Write a message…" value={body} onChange={e => setBody(e.target.value)}
          />
          <Button type="submit" variant="primary" size="sm" loading={sending}>
            <Send size={16} />
          </Button>
        </form>
      )}
      {closed && <p className="text-xs text-faint text-center py-3">This conversation is {thread.status.toLowerCase()}</p>}
    </div>
  );
}
