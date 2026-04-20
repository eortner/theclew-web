"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "emoclew_beta_dismissed";

export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
      <p className="text-xs text-amber-300 leading-relaxed">
        <span className="font-bold uppercase tracking-widest mr-2">Emoclew Beta</span>
        This is a technology preview. No legal, financial, or contractual obligations apply to your participation.{" "}
        <Link href="/beta-terms" className="underline underline-offset-2 hover:text-amber-200 transition-colors">
          Learn more →
        </Link>
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-amber-400/60 hover:text-amber-300 transition-colors"
        aria-label="Dismiss beta banner"
      >
        <X size={14} />
      </button>
    </div>
  );
}