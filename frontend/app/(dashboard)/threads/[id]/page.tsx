"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Thread, Message } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EquityBar } from "@/components/dashboard/EquityBar";
import { formatDistanceToNow } from "@/lib/time";
import { ArrowLeft, Send, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { TotpGate } from "@/components/ui/TotpGate";
import { useTotpSession } from "@/hooks/useTotpSession";

export default function ThreadDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { user }  = useUser();

  const [thread, setThread]               = useState<Thread & { messages: Message[] } | null>(null);
  const [body, setBody]                   = useState("");
  const [sending, setSending]             = useState(false);
  const [mergeStep, setMergeStep]         = useState<"equity" | "reauth" | "confirm" | null>(null);
  const [proposedEquity, setProposedEquity] = useState(42.5);
  const [totpToken, setTotpToken]         = useState("");
  const [mergeLoading, setMergeLoading]   = useState(false);
  const [mergeError, setMergeError]       = useState("");
  const bottomRef                         = useRef<HTMLDivElement>(null);
  const { isValid: totpSessionValid }     = useTotpSession();

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
      // Step 1: verify TOTP — refreshes totpVerifiedAt on the server
      await api.totp.reauth(totpToken);
      // Step 2: record reauth on the merge party
      await api.post(`/merge/${id}/reauth`, {});
      setTotpToken("");
      setMergeStep("confirm");
      load();
    } catch (e: any) {
      // If TOTP not set up, redirect to settings
      if (e.message?.includes("totpRequired") || e.message?.includes("must be enabled")) {
        router.push("/settings/totp");
        return;
      }
      setMergeError(e.message);
    } finally { setMergeLoading(false); }
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

  const isMerge  = ["MERGE", "ACQUISITION"].includes(thread.type);
  const closed   = ["FINALISED", "DECLINED", "EXPIRED"].includes(thread.status);
  const totpEnabled = (user as any)?.totpEnabled ?? false;
  const myParty  = thread.mergeParties?.find(p => p.user.id === user?.id);

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/threads" className="text-muted hover:text-text transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-text">{thread.subject}</h1>
          <p className="text-xs text-muted">
            {thread.initiator.name} · {thread.recipient.name} · {thread.status.replace(/_/g, " ")}
          </p>
        </div>
        {isMerge && !closed && (
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => totpEnabled ? setMergeStep("equity") : router.push("/settings/totp")}
              title={!totpEnabled ? "Enable 2FA to start merge flow" : undefined}
              className={!totpEnabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              Merge flow
            </Button>
            <Button variant="danger" size="sm" onClick={declineMerge}>Decline</Button>
          </div>
        )}
      </div>

      {/* Terms note — shown for merge/acquisition threads */}
      {isMerge && (thread as any).termsNote && (
        <div className="mb-4 p-4 rounded-xl border border-white/[0.07] bg-surface flex gap-3">
          <FileText size={14} className="text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[0.65rem] uppercase tracking-widest text-gold mb-1">Terms note</p>
            <p className="text-xs text-muted leading-relaxed">{(thread as any).termsNote}</p>
          </div>
        </div>
      )}

      {/* Equity bar */}
      {isMerge && (
        <div className="mb-4">
          <EquityBar
            interactive={mergeStep === "equity"}
            onPropose={setProposedEquity}
            emoclewPct={15}
            founderPct={myParty?.proposedEquity ?? 42.5}
          />
        </div>
      )}

      {/* Merge flow panel */}
      {mergeStep && (
        <div className="bg-surface border border-ember/30 rounded-xl p-6 mb-4 space-y-4">

          {mergeStep === "equity" && (
            <>
              <p className="text-sm font-semibold text-text">Step 1 — Propose equity split</p>
              <p className="text-xs text-muted">
                Use the bar above to set your proposed share. Emoclew always retains 15%.
                Minimum 5% per founder.
              </p>
              <p className="text-xs text-spark">Your proposal: <strong>{proposedEquity}%</strong></p>
              {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
              <Button variant="primary" size="sm" loading={mergeLoading} onClick={proposeEquity}>
                Submit proposal
              </Button>
            </>
          )}

          {mergeStep === "reauth" && (
            <TotpGate onSessionRestored={() => reAuth()}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ember/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} className="text-ember" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">Step 2 — Verify your identity</p>
                    <p className="text-xs text-muted">
                      Enter your authenticator code. This acts as your digital signature.
                    </p>
                  </div>
                </div>
                <Input
                  label="Authenticator code"
                  value={totpToken}
                  onChange={e => setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
                <Button
                  variant="primary" size="sm" loading={mergeLoading}
                  disabled={totpToken.length !== 6}
                  onClick={reAuth}
                >
                  Verify identity
                </Button>
              </div>
            </TotpGate>
          )}

          {mergeStep === "confirm" && (
            <>
              <p className="text-sm font-semibold text-spark">Step 3 — Final confirmation</p>
              <p className="text-xs text-muted leading-relaxed">
                This action is <strong className="text-text">irreversible</strong>. Once both parties confirm,
                the merge is final. The merged entity inherits the higher of the two project levels.
                Emoclew retains 15% equity.
              </p>
              {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
              <Button variant="primary" size="sm" loading={mergeLoading} onClick={confirmMerge}>
                I understand — confirm merge
              </Button>
            </>
          )}

          <button onClick={() => { setMergeStep(null); setMergeError(""); setTotpToken(""); }}
            className="text-xs text-faint hover:text-muted transition-colors">
            Cancel
          </button>
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
      {closed && (
        <p className="text-xs text-faint text-center py-3">
          This conversation is {thread.status.toLowerCase().replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
}