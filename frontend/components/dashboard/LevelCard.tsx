import { Card, CardLabel } from "@/components/ui/Card";
import { LEVEL_META } from "@/types";

export function LevelCard({ level }: { level: number }) {
  const current = LEVEL_META[level];
  const next    = LEVEL_META[level + 1];

  return (
    <Card>
      <CardLabel>Your level</CardLabel>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-display text-5xl font-black" style={{ color: current.color }}>{level}</span>
        <span className="font-display text-2xl font-bold" style={{ color: current.color }}>{current.name.toUpperCase()}</span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ember" />
          <span className="text-xs text-muted">{current.fee}</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">{current.unlocks}</p>
      </div>
      {next && (
        <div className="border-t border-white/[0.07] pt-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-faint mb-1">Next: {next.name}</p>
          <p className="text-xs text-muted">{next.unlocks}</p>
        </div>
      )}
      {/* Level track */}
      <div className="flex items-center gap-1 mt-4">
        {LEVEL_META.map((l, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i <= level ? l.color : 'rgba(255,255,255,0.07)' }} />
        ))}
      </div>
    </Card>
  );
}
