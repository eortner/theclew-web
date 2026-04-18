"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Tag, TAG_CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/cn";

const CATEGORY_ORDER = ["domain", "tech", "model", "stage", "geo"];
const MIN_TAGS = 3;
const MAX_TAGS = 10;

function groupByCategory(tags: Tag[]): Record<string, Tag[]> {
  return tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const cat = tag.category ?? "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tag);
    return acc;
  }, {});
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: "PRIVATE",
  });
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const { data: allTags, error: tagsError } = useSWR<Tag[]>(
    "/tags",
    () => api.tags.list<Tag[]>()
  );

  function toggleTag(name: string) {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        if (next.size >= MAX_TAGS) return prev;
        next.add(name);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (selectedTags.size < MIN_TAGS) {
      setError(`Select at least ${MIN_TAGS} tags.`);
      return;
    }

    setLoading(true);
    try {
      const p = await api.post<{ id: string }>("/projects", {
        name:       form.name,
        description: form.description,
        visibility: form.visibility,
        tags:       Array.from(selectedTags),
      });
      router.push(`/projects/${p.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const grouped = allTags ? groupByCategory(allTags) : {};

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-ember mb-2">Projects</p>
      <h1 className="font-display text-4xl font-black fire-text mb-8">NEW PROJECT</h1>

      <div className="bg-surface border border-white/[0.07] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <Input
            label="Project name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full bg-bg border border-white/[0.07] text-text rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-ember/50 min-h-[120px] resize-y"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              minLength={20}
              placeholder="What is this project about? (min 20 characters)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">
              Visibility
            </label>
            <select
              className="w-full bg-bg border border-white/[0.07] text-text rounded-lg px-4 py-2.5 text-sm outline-none focus:border-ember/50"
              value={form.visibility}
              onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
            >
              <option value="PRIVATE">Private — hidden but discoverable by similarity</option>
              <option value="SELECTIVE">Selective — share details on request</option>
              <option value="PUBLIC">Public — fully visible</option>
            </select>
          </div>

          {/* Tag picker */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Tags
              </label>
              <span className={cn(
                "text-xs tabular-nums",
                selectedTags.size === 0 ? "text-faint" :
                selectedTags.size < MIN_TAGS ? "text-ember" : "text-spark"
              )}>
                {selectedTags.size} / {MAX_TAGS} selected
              </span>
            </div>
            <p className="text-xs text-faint -mt-1">
              Select {MIN_TAGS}–{MAX_TAGS} tags that best describe your project.
            </p>

            {tagsError && (
              <p className="text-sm text-red-400">Failed to load tags. Reload and try again.</p>
            )}

            {!allTags && !tagsError && (
              <p className="text-xs text-faint animate-pulse">Loading tags…</p>
            )}

            {allTags && CATEGORY_ORDER.map(cat => {
              const tags = grouped[cat];
              if (!tags?.length) return null;
              return (
                <div key={cat}>
                  <p className="text-[0.65rem] uppercase tracking-widest text-ember mb-2">
                    {TAG_CATEGORY_LABELS[cat] ?? cat}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                      const selected = selectedTags.has(tag.name);
                      const disabled = !selected && selectedTags.size >= MAX_TAGS;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleTag(tag.name)}
                          className={cn(
                            "text-xs px-3 py-1 rounded-full border transition-colors",
                            selected
                              ? "bg-ember/20 border-ember/60 text-ember"
                              : disabled
                              ? "border-white/[0.04] text-faint cursor-not-allowed"
                              : "border-white/[0.07] text-muted hover:border-ember/30 hover:text-text"
                          )}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create project
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}