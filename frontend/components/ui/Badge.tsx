import { cn } from "@/lib/cn";
export function Badge({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border", className)}>
      {children}
    </span>
  );
}
