import { Card, CardLabel } from "@/components/ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Project } from "@/types";

export function RevenueCard({ projects }: { projects: Project[] }) {
  // Each project starts at -$10 (yearly fee) at Level 0
  const total = projects.reduce((sum, p) => sum - 10, 0);
  const isPositive = total >= 0;

  return (
    <Card>
      <CardLabel>Net revenue</CardLabel>
      <div className="flex items-baseline gap-2 mb-4">
        {isPositive
          ? <TrendingUp size={20} className="text-spark mb-1" />
          : <TrendingDown size={20} className="text-ember mb-1" />}
        <span className={`font-display text-4xl font-black ${isPositive ? "text-spark" : "text-ember"}`}>
          {total < 0 ? "-" : "+"}${Math.abs(total)}
        </span>
        <span className="text-xs text-muted">/ year</span>
      </div>
      <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
            <span className="text-xs text-muted truncate max-w-[160px]">{p.name}</span>
            <span className="text-xs text-ember font-mono">-$10</span>
          </div>
        ))}
        {projects.length === 0 && <p className="text-xs text-faint">No projects yet</p>}
      </div>
    </Card>
  );
}
