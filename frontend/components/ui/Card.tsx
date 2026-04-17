import { cn } from '@/lib/cn';
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-surface border border-white/[0.07] rounded-xl p-6', className)}>
      {children}
    </div>
  );
}
export function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.65rem] font-bold uppercase tracking-widest text-ember mb-3">{children}</p>;
}
