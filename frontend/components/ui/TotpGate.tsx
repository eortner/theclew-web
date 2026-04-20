"use client";
import { useState, useEffect } from "react";
import { useTotpSession } from "@/hooks/useTotpSession";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ShieldOff, Timer } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  children: React.ReactNode;
  // Called after successful (re)verify so parent can retry blocked action
  onSessionRestored?: () => void;
}

function CountdownRing({ secondsLeft }: { secondsLeft: number }) {
  const total   = 300; // 5 min
  const pct     = secondsLeft / total;
  const radius  = 16;
  const circ    = 2 * Math.PI * radius;
  const offset  = circ * (1 - pct);

  const color = secondsLeft > 60
    ? "#e85d04"   // ember — plenty of time
    : secondsLeft > 20
    ? "#ffd166"   // gold — getting low
    : "#ef4444";  // red — almost gone

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="flex items-center gap-2">
      <svg width="40" height="40" viewBox="0 0 40 40">
        {/* Track */}
        <circle cx="20" cy="20" r={radius}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
        {/* Progress */}
        <circle cx="20" cy="20" r={radius}
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
        />
      </svg>
      <div>
        <p className="text-[0.6rem] uppercase tracking-widest text-faint">Session</p>
        <p className="text-sm font-mono font-bold" style={{ color }}>
          {mins}:{secs.toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}

function ReVerifyForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel?: () => void }) {
  const { refresh }   = useTotpSession();
  const [token, setToken]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await refresh(token);
      onSuccess();
    } catch {
      setError("Invalid code — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}
      className="border border-ember/30 bg-surface rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-ember/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={16} className="text-ember" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text">Re-verify your identity</p>
          <p className="text-xs text-muted">Your 2FA session expired. Enter your authenticator code to continue.</p>
        </div>
      </div>
      <Input
        label="Authenticator code"
        value={token}
        onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        inputMode="numeric"
        autoComplete="one-time-code"
      />
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" variant="primary" size="sm"
          loading={loading} disabled={token.length !== 6}>
          Verify and continue
        </Button>
      </div>
    </form>
  );
}

export function TotpGate({ children, onSessionRestored }: Props) {
  const { secondsLeft, isValid } = useTotpSession();
  const [showReVerify, setShowReVerify] = useState(false);

  // When session expires, show re-verify automatically
  useEffect(() => {
    if (!isValid && secondsLeft === 0) {
      // Only auto-show if they had a session (not on first load)
      setShowReVerify(false);
    }
  }, [isValid, secondsLeft]);

  if (showReVerify) {
    return (
      <ReVerifyForm
        onSuccess={() => {
          setShowReVerify(false);
          onSessionRestored?.();
        }}
        onCancel={() => setShowReVerify(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Countdown bar — only shown when session is active */}
      {isValid && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[0.65rem] text-faint">
            <Timer size={11} />
            <span>Signing session active</span>
          </div>
          <CountdownRing secondsLeft={secondsLeft} />
        </div>
      )}

      {/* Expired state — not yet re-verifying */}
      {!isValid && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.07] bg-surface">
          <div className="flex items-center gap-2">
            <ShieldOff size={14} className="text-faint" />
            <span className="text-xs text-faint">Session expired</span>
          </div>
          <button
            onClick={() => setShowReVerify(true)}
            className="text-xs text-ember hover:text-spark transition-colors font-medium"
          >
            Re-verify →
          </button>
        </div>
      )}

      {children}
    </div>
  );
}