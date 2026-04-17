"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/register", form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-black fire-text mb-2">EMOCLEW</h1>
          <p className="text-sm text-muted">Create your builder account</p>
        </div>
        <div className="bg-surface border border-white/[0.07] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full name" type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required minLength={8} />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">Create account</Button>
          </form>
          <p className="text-center text-xs text-faint mt-6">
            Already have an account? <Link href="/login" className="text-gold hover:text-spark transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
