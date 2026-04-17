"use client";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <span className="fire-text font-display text-2xl animate-pulse">EMOCLEW</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar userName={(user as any).name} avatarUrl={(user as any).avatarUrl} />
      <Sidebar />
      <main className="pl-56 pt-14 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
