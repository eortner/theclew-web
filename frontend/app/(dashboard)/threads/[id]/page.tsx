"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Thread, Message, LEVEL_META, platformEquityForLevel } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EquityBar } from "@/components/dashboard/EquityBar";
import { formatDistanceToNow } from "@/lib/time";
import { ArrowLeft, Send, ShieldCheck, FileText, Vote, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { TotpGate } from "@/components/ui/TotpGate";

export default function ThreadDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user } = useUser();

  const [thread, setThread]                 = useState<Thread & { messages: Message[] } | null>(null);
  const [body, setBody]                     = useState("");
  const [sending, setSending]               = useState(false);
  const [mergeStep, setMergeStep]           = useState<"equity" | "reauth" | "confirm" | "vote" | "safe" | null>(null);
  const [proposedEquity, setProposedEquity] = useState(42.5);
  const [totpToken, setTotpToken]           = useState("");
  const [mergeLoading, setMergeLoading]     = useState(false);
  const [mergeError, setMergeError]         = useState("");
  const [safeData, setSafeData]             = useState<any>(null);
  const bottomRef                           = useRef<HTMLDivElement>(null);

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
    try { await api.post(`/threads/${id}/messages`, { body }); setBody(""); load(); }
    finally { setSending(false); }
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
      await api.totp.reauth(totpToken);
      await api.post(`/merge/${id}/reauth`, {});
      setTotpToken(""); setMergeStep("confirm"); load();
    } catch (e: any) {
      if (e.message?.includes("totpRequired") || e.message?.includes("must be enabled")) {
        router.push("/settings/totp"); return;
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

  async function castVote(approve: boolean) {
    setMergeLoading(true); setMergeError("");
    try {
      await api.post(`/merge/${id}/vote`, { approve });
      load();
    } catch (e: any) { setMergeError(e.message); }
    finally { setMergeLoading(false); }
  }

  async function loadSafe() {
    try {
      const data = await api.get<any>(`/merge/${id}/safe`);
      setSafeData(data); setMergeStep("safe");
    } catch (e: any) { setMergeError(e.message); }
  }

  async function declineMerge() {
    if (!confirm("Are you sure you want to decline this merge?")) return;
    await api.post(`/merge/${id}/decline`, {});
    load();
  }

  if (!thread) return <div className="text-muted text-sm animate-pulse">Loading…</div>;

  const isMerge     = ["MERGE", "ACQUISITION"].includes(thread.type);
  const closed      = ["FINALISED", "DECLINED", "EXPIRED"].includes(thread.status);
  const finalised   = thread.status === "FINALISED";
  const totpEnabled = (user as any)?.totpEnabled ?? false;
  const myParty     = thread.mergeParties?.find(p => p.user.id === user?.id);
  const otherParty  = thread.mergeParties?.find(p => p.user.id !== user?.id);
  const higherLevel = Math.max(thread.initiatorProject?.currentLevel ?? 0, thread.recipientProject?.currentLevel ?? 0);
  const platformPct = platformEquityForLevel(higherLevel);
  const myVote      = thread.votes?.find(v => v.userId === user?.id);

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
        <div className="flex gap-2 flex-wrap">
          {isMerge && !closed && (
            <>
              <Button variant="outline" size="sm"
                onClick={() => totpEnabled ? setMergeStep("equity") : router.push("/settings/totp")}
                className={!totpEnabled ? "opacity-50 cursor-not-allowed" : ""}>
                Merge flow
              </Button>
              <Button variant="danger" size="sm" onClick={declineMerge}>Decline</Button>
            </>
          )}
          {finalised && (
            <Button variant="outline" size="sm" onClick={loadSafe}>
              <FileText size={14} className="mr-1" /> View SAFE
            </Button>
          )}
        </div>
      </div>

      {/* Terms note */}
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
            emoclewPct={platformPct}
            founderPct={myParty?.proposedEquity ?? Math.floor((100 - platformPct) / 2)}
          />
        </div>
      )}

      {/* Party status */}
      {isMerge && thread.mergeParties && thread.mergeParties.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {thread.mergeParties.map(p => (
            <div key={p.id} className="bg-surface border border-white/[0.07] rounded-lg p-3">
              <p className="text-xs font-semibold text-text mb-1">{p.user.name}</p>
              <p className="text-[0.65rem] text-faint">{p.status.replace(/_/g, " ")}</p>
              {p.proposedEquity != null && (
                <p className="text-[0.65rem] text-ember mt-1">Proposed: {p.proposedEquity}%</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Voting panel */}
      {isMerge && thread.votes && thread.votes.length > 0 && (
        <div className="mb-4 bg-surface border border-gold/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Vote size={14} className="text-gold" />
            <p className="text-xs font-semibold text-gold uppercase tracking-wider">Community Ratification</p>
          </div>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-spark" />
              <span className="text-xs text-spark font-semibold">{thread.votes.filter(v => v.approve).length} approve</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle size={12} className="text-red-400" />
              <span className="text-xs text-red-400 font-semibold">{thread.votes.filter(v => !v.approve).length} reject</span>
            </div>
          </div>
          {!myVote && !closed && (
            <div className="flex gap-2">
              <Button variant="primary" size="sm" loading={mergeLoading} onClick={() => castVote(true)}>
                <CheckCircle size={12} className="mr-1" /> Approve
              </Button>
              <Button variant="danger" size="sm" loading={mergeLoading} onClick={() => castVote(false)}>
                <XCircle size={12} className="mr-1" /> Reject
              </Button>
            </div>
          )}
          {myVote && (
            <p className="text-xs text-faint">You voted: <span className={myVote.approve ? "text-spark" : "text-red-400"}>{myVote.approve ? "Approve" : "Reject"}</span></p>
          )}
          {mergeError && <p className="text-xs text-red-400 mt-2">{mergeError}</p>}
        </div>
      )}

      {/* SAFE Contract view */}
      {mergeStep === "safe" && safeData && (
        <div className="mb-4 bg-surface border border-ember/20 rounded-xl p-6 space-y-4 overflow-y-auto max-h-96">
          <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-2">
            <p className="text-[0.65rem] text-gold font-semibold">⚠️ Beta Notice — Out of beta this will be a digitally signed legal document</p>
          </div>

          <div className="text-center border-b border-white/[0.07] pb-4">
            <p className="font-display text-xl font-black text-text">SIMPLE AGREEMENT FOR FUTURE EQUITY</p>
            <p className="text-xs text-faint mt-1">Merge Agreement · Emoclew Platform</p>
          </div>

          <div className="space-y-3 text-xs text-muted">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-1">Date</p>
                <p className="text-text">{new Date(safeData.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-1">Status</p>
                <p className="text-spark font-semibold">FINALISED</p>
              </div>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-2">Surviving Entity</p>
              <p className="text-text font-semibold">{safeData.survivingProject?.name}</p>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-2">Merged Entity (archived)</p>
              <p className="text-text">{safeData.mergedProject?.name}</p>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-2">Equity Structure</p>
              <div className="space-y-2 bg-bg rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-cyan">Emoclew Platform</span>
                  <span className="text-cyan font-semibold">{safeData.platformEquity}%</span>
                </div>
                {safeData.parties.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-ember">{p.name}</span>
                    <span className="text-ember font-semibold">{p.equityPercent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-2">Signatories</p>
              <div className="space-y-2">
                {safeData.parties.map((p: any, i: number) => (
                  <div key={i} className="bg-bg rounded-lg p-3">
                    <p className="text-text font-semibold">{p.name}</p>
                    <p className="text-faint text-[0.65rem]">{p.email}</p>
                    <p className="text-faint text-[0.65rem]">TOTP verified: {p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : 'N/A'}</p>
                    <p className="text-faint text-[0.65rem]">Confirmed: {p.confirmedAt ? new Date(p.confirmedAt).toLocaleString() : 'N/A'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ShieldCheck size={10} className="text-spark" />
                      <span className="text-[0.6rem] text-spark">Identity verified via TOTP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.07] pt-3 text-[0.65rem] text-faint leading-relaxed">
              This agreement records the merger of the above entities on the Emoclew platform. Equity percentages are recorded as agreed by both founding parties following mandatory TOTP re-authentication. Emoclew retains {safeData.platformEquity}% platform equity as per the terms accepted at registration. This document is portable to AngelList, Carta, or legal counsel.
            </div>
          </div>

          <button onClick={() => setMergeStep(null)} className="text-xs text-faint hover:text-muted transition-colors">
            Close
          </button>
        </div>
      )}

      {/* Merge flow panel */}
      {mergeStep && mergeStep !== "safe" && (
        <div className="bg-surface border border-ember/30 rounded-xl p-6 mb-4 space-y-4">
          {mergeStep === "equity" && (
            <>
              <p className="text-sm font-semibold text-text">Step 1 — Propose equity split</p>
              <p className="text-xs text-muted">Use the bar above to set your proposed share. Emoclew retains {platformPct}%. Minimum 5% per founder.</p>
              <p className="text-xs text-spark">Your proposal: <strong>{proposedEquity}%</strong></p>
              {otherParty?.proposedEquity != null && (
                <p className="text-xs text-muted">{otherParty.user.name} proposed: <strong className="text-gold">{otherParty.proposedEquity}%</strong></p>
              )}
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
                    <p className="text-xs text-muted">Enter your authenticator code. This acts as your digital signature.</p>
                  </div>
                </div>
                <Input label="Authenticator code" value={totpToken}
                  onChange={e => setTotpToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" inputMode="numeric" autoComplete="one-time-code" />
                {mergeError && <p className="text-xs text-red-400">{mergeError}</p>}
                <Button variant="primary" size="sm" loading={mergeLoading} disabled={totpToken.length !== 6} onClick={reAuth}>
                  Verify identity
                </Button>
              </div>
            </TotpGate>
          )}

          {mergeStep === "confirm" && (
            <>
              <p className="text-sm font-semibold text-spark">Step 3 — Final confirmation</p>
              <p className="text-xs text-muted leading-relaxed">
                This action is <strong className="text-text">irreversible</strong>. Once both parties confirm, the merge goes to community ratification.
                The surviving entity is <strong className="text-text">{thread.recipientProject?.name}</strong>.
                Emoclew retains <strong className="text-cyan">{platformPct}%</strong> equity.
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
            placeholder="Write a message…" value={body} onChange={e => setBody(e.target.value)} />
          <Button type="submit" variant="primary" size="sm" loading={sending}><Send size={16} /></Button>
        </form>
      )}
      {closed && (
        <p className="text-xs text-faint text-center py-3">
          This conversation is {thread.status.toLowerCase().replace(/_/g, " ")}
          {finalised && " — "}
          {finalised && <button onClick={loadSafe} className="text-gold hover:text-spark underline">view SAFE contract</button>}
        </p>
      )}
    </div>
  );
}