"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", visibility: "PRIVATE",
    metatags: "", tags: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const metatags = form.metatags.split(",").map(t => t.trim()).filter(Boolean);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (metatags.length < 3) { setError("Enter at least 3 metatags (comma-separated)"); setLoading(false); return; }
    if (tags.length !== 10) { setError("Enter exactly 10 tags (comma-separated)"); setLoading(false); return; }
    try {
      const p = await api.post<{ id: string }>("/projects", {
        name: form.name, description: form.description,
        visibility: form.visibility, metatags, tags,
      });
      router.push(`/projects/${p.id}`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-ember mb-2">Projects</p>
      <h1 className="font-display text-4xl font-black fire-text mb-8">NEW PROJECT</h1>
      <div className="bg-surface border border-white/[0.07] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Project name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Description</label>
            <textarea
              className="w-full bg-bg border border-white/[0.07] text-text rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-ember/50 min-h-[120px] resize-y"
              value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              required minLength={20} placeholder="What is this project about? (min 20 characters)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">Visibility</label>
            <select
              className="w-full bg-bg border border-white/[0.07] text-text rounded-lg px-4 py-2.5 text-sm outline-none focus:border-ember/50"
              value={form.visibility} onChange={e => setForm(f => ({...f, visibility: e.target.value}))}>
              <option value="PRIVATE">Private — hidden but discoverable by metadata</option>
              <option value="SELECTIVE">Selective — share details on request</option>
              <option value="PUBLIC">Public — fully visible</option>
            </select>
          </div>
          <Input label="Metatags (min 3, comma-separated)" value={form.metatags}
            onChange={e => setForm(f => ({...f, metatags: e.target.value}))}
            placeholder="ai, saas, b2b" required />
          <Input label="Tags (exactly 10, comma-separated)" value={form.tags}
            onChange={e => setForm(f => ({...f, tags: e.target.value}))}
            placeholder="productivity, automation, remote, startup, ..." required />
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Create project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
