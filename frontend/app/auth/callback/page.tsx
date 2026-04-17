"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The backend sets the httpOnly cookie and redirects here.
// Nothing to do except forward to dashboard.
export default function OAuthCallbackPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <span className="fire-text font-display text-2xl animate-pulse">Signing you in…</span>
    </div>
  );
}
