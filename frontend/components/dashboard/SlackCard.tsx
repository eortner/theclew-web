import { Card, CardLabel } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function SlackCard() {
  const slackUrl = process.env.NEXT_PUBLIC_SLACK_INVITE_URL ?? "#";
  return (
    <Card>
      <CardLabel>Community</CardLabel>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg fire-bg flex items-center justify-center text-bg font-display font-black text-lg flex-shrink-0">#</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text mb-1">Emoclew Slack</p>
          <p className="text-xs text-muted leading-relaxed mb-4">
            Connect with other builders, find co-founders, share progress, and get support from the community.
          </p>
          <a href={slackUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Join the community →</Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
