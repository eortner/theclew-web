"use client";
import { useEffect, useState } from "react";
import { Card, CardLabel } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export function SlackCard() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ url: string | null }>("/slack/invite-url")
      .then(res => setUrl(res.url))
      .catch(() => setUrl(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardLabel>Community</CardLabel>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg fire-bg flex items-center justify-center text-bg font-display font-black text-lg flex-shrink-0">
          #
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text mb-1">Emoclew Slack</p>
          <p className="text-xs text-muted leading-relaxed mb-3">
            Connect with other builders, find co-founders, share progress, and get support from the community.
          </p>
          <p className="text-[0.65rem] text-amber-400/70 mb-3 leading-relaxed">
            Beta community — conversations are informal and carry no legal obligations.
          </p>
          {loading ? (
            <Button variant="outline" size="sm" disabled>Loading…</Button>
          ) : url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Join the community →</Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled className="opacity-40 cursor-not-allowed">
              Coming soon
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}