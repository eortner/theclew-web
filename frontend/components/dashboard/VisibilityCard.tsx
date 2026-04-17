import { Card, CardLabel } from "@/components/ui/Card";
import { Eye, EyeOff, Share2 } from "lucide-react";

export function VisibilityCard() {
  return (
    <Card>
      <CardLabel>Your project visibility</CardLabel>
      <div className="space-y-3">
        {[
          { icon: EyeOff, label: "Private", desc: "Details hidden — but your metadata is always active", active: true },
          { icon: Share2,  label: "Selective", desc: "Share details with specific people on request", active: false },
          { icon: Eye,    label: "Public", desc: "Fully visible, eligible for community ranking", active: false },
        ].map(({ icon: Icon, label, desc, active }) => (
          <div key={label} className={`flex gap-3 p-3 rounded-lg border transition-colors ${active ? "border-ember/30 bg-ember/5" : "border-white/[0.04]"}`}>
            <Icon size={16} className={active ? "text-ember mt-0.5" : "text-faint mt-0.5"} />
            <div>
              <p className={`text-xs font-semibold ${active ? "text-ember" : "text-muted"}`}>{label}</p>
              <p className="text-xs text-faint leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[0.65rem] text-faint mt-3 leading-relaxed">
        Even in Private mode your project is discoverable by metadata — co-founders and investors can find you.
      </p>
    </Card>
  );
}
