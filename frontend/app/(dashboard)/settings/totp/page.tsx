"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import { TotpGate } from "@/components/ui/TotpGate";

type Step = "idle" | "setup" | "verify" | "disable";

export default function TotpSettingsPage() {
  const { user, mutate } = useUser();

  const [step, setStep]           = useState<Step>("idle");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [token, setToken]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);

  if (!user) return null;

  const totpEnabled = user.totpEnabled;

  function reset() {
    setStep("idle");
    setToken("");
    setError("");
    setOtpauthUrl("");
  }

  function QrCode({ value }: { value: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, value, {
          width:  200,
          margin: 2,
          color:  { dark: "#e8e4dc", light: "#0e0d0b" },
        });
      }
    }, [value]);

    return (
      <div className="flex justify-center p-4 bg-bg border border-white/[0.07] rounded-xl">
        <canvas ref={canvasRef} />
      </div>
    );
  }

  async function handleSetup() {
    setError(""); setLoading(true);
    try {
      const res = await api.totp.setup();
      setOtpauthUrl(res.otpauthUrl);
      setStep("setup");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.totp.verify(token.trim());
      await mutate();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.totp.disable(token.trim());
      await mutate();
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to disable TOTP");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(otpauthUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-ember mb-2">Settings</p>
      <h1 className="font-display text-4xl font-black fire-text mb-8">SECURITY</h1>

      <div className="bg-surface border border-white/[0.07] rounded-2xl p-8 space-y-6">

        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text">Two-factor authentication</p>
            <p className="text-xs text-faint mt-0.5">
              Required for all contract signing and merge actions.
            </p>
          </div>
          <span className={cn(
            "text-xs px-3 py-1 rounded-full border font-medium",
            totpEnabled
              ? "bg-spark/10 border-spark/30 text-spark"
              : "bg-white/5 border-white/10 text-muted"
          )}>
            {totpEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <hr className="border-white/[0.07]" />

        {/* Idle — not enabled */}
        {!totpEnabled && step === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Use any RFC 6238-compatible app (Google Authenticator, Authy, etc.) to generate codes.
            </p>
            <Button variant="primary" onClick={handleSetup} loading={loading}>
              <ShieldCheck size={14} className="mr-2" /> Set up authenticator
            </Button>
          </div>
        )}

        {/* Step 1 — show otpauthUrl */}
        {step === "setup" && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Scan the QR code with Google Authenticator, Authy, or any RFC 6238 app.
              If you cannot scan, copy the URI manually.
            </p>
            {otpauthUrl && <QrCode value={otpauthUrl} />}
            <div className="relative bg-bg border border-white/[0.07] rounded-lg px-4 py-3">
              <p className="text-xs text-faint font-mono break-all pr-8">{otpauthUrl}</p>
              <button type="button" onClick={copyToClipboard}
                className="absolute top-3 right-3 text-muted hover:text-text transition-colors" aria-label="Copy URI">
                {copied ? <Check size={14} className="text-spark" /> : <Copy size={14} />}
              </button>
            </div>
            <Button variant="outline" onClick={() => setStep("verify")}>
              I've added it — enter code to confirm
            </Button>
            <Button variant="ghost" onClick={reset} className="ml-2">Cancel</Button>
          </div>
        )}

        {/* Step 2 — verify token to enable */}
        {step === "verify" && (
          <TotpGate>
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-muted">
                Enter the 6-digit code from your authenticator app to activate TOTP.
              </p>
              <Input
                label="Authenticator code"
                value={token}
                onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>
                <Button type="submit" variant="primary" loading={loading} disabled={token.length !== 6}>
                  Activate
                </Button>
              </div>
            </form>
          </TotpGate>
        )}

        {/* Idle — already enabled */}
        {totpEnabled && step === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Your account is protected. TOTP re-verification is required for all contract-signing actions.
            </p>
            <Button variant="ghost" onClick={() => { setStep("disable"); setError(""); }}
              className="text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40">
              <ShieldOff size={14} className="mr-2" /> Disable authenticator
            </Button>
          </div>
        )}

        {/* Disable flow */}
        {step === "disable" && (
          <TotpGate>
            <form onSubmit={handleDisable} className="space-y-4">
              <p className="text-sm text-muted">
                Enter your current authenticator code to confirm you want to disable TOTP.
              </p>
              <Input
                label="Authenticator code"
                value={token}
                onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>
                <Button type="submit" loading={loading} disabled={token.length !== 6}
                  className="border border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Disable TOTP
                </Button>
              </div>
            </form>
          </TotpGate>
        )}

      </div>
    </div>
  );
}