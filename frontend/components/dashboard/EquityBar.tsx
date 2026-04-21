"use client";
import { Card, CardLabel } from "@/components/ui/Card";
import { useState } from "react";

interface Segment { label: string; pct: number; color: string }

interface Props {
  emoclewPct?: number;
  founderPct?: number;
  investorPct?: number;
  interactive?: boolean;
  onPropose?: (founderPct: number) => void;
}

export function EquityBar({ emoclewPct = 15, founderPct = 85, investorPct = 0, interactive, onPropose }: Props) {
  const [proposedFounder, setProposedFounder] = useState(founderPct - investorPct);

  const segments: Segment[] = [
    { label: "Emoclew", pct: emoclewPct,      color: "#48cae4" },
    { label: "You",     pct: proposedFounder, color: "#e85d04" },
    ...(investorPct > 0 ? [{ label: "Investors", pct: investorPct, color: "#ffd166" }] : []),
  ];

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const newFounder = Math.min(Math.max(clickedPct - emoclewPct, 5), 100 - emoclewPct - 5);
    setProposedFounder(newFounder);
    onPropose?.(newFounder);
  }

  return (
    <Card>
      <CardLabel>Equity structure</CardLabel>
      <div className={`flex h-10 rounded-lg overflow-hidden w-full mb-4 ${interactive ? "cursor-pointer" : ""}`}
        onClick={handleBarClick}>
        {segments.map((s, i) => (
          <div key={i}
            className="flex items-center justify-center text-[0.6rem] font-bold text-bg transition-all duration-300"
            style={{ width: `${s.pct}%`, background: s.color, minWidth: s.pct > 5 ? undefined : 0 }}>
            {s.pct > 8 ? `${s.pct}%` : ""}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-xs text-muted">{s.label}</span>
            <span className="text-xs font-semibold text-text">{s.pct}%</span>
          </div>
        ))}
      </div>
      {interactive && <p className="text-[0.65rem] text-faint mt-3">Click the bar to adjust your proposed equity split</p>}
    </Card>
  );
}