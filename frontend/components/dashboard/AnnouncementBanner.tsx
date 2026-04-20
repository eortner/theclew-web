"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { X, Flame } from "lucide-react";

interface Announcement {
  key:   string;
  title: string;
  body:  string;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visible, setVisible]             = useState(false);

  useEffect(() => {
    api.get<Announcement[]>("/announcements").then(data => {
      if (data.length > 0) {
        setAnnouncements(data);
        // Slight delay so the page renders first, then banner slides in
        setTimeout(() => setVisible(true), 400);
      }
    }).catch(() => {});
  }, []);

  async function dismiss(key: string) {
    setVisible(false);
    setTimeout(async () => {
      await api.post(`/announcements/${key}/dismiss`, {}).catch(() => {});
      setAnnouncements(prev => prev.filter(a => a.key !== key));
    }, 350);
  }

  if (announcements.length === 0) return null;
  const current = announcements[0];

  return (
    <div className={`
      overflow-hidden transition-all duration-350 ease-in-out mb-6
      ${visible ? "max-h-40 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}
    `}>
      <div className="relative rounded-xl border border-ember/30 bg-gradient-to-r from-ember/10 via-gold/5 to-transparent p-5 pr-12">
        {/* Animated ember dot */}
        <span className="absolute left-5 top-5 w-2 h-2 rounded-full bg-ember animate-pulse" />
        <div className="pl-5">
          <p className="text-xs uppercase tracking-widest text-ember mb-1 flex items-center gap-1.5">
            <Flame size={11} /> Founder update
          </p>
          <p className="text-sm font-semibold text-text mb-1">{current.title}</p>
          <p className="text-xs text-muted leading-relaxed">{current.body}</p>
        </div>
        <button
          onClick={() => dismiss(current.key)}
          className="absolute top-4 right-4 text-faint hover:text-muted transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}