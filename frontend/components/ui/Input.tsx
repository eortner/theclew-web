import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef } from "react";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full bg-bg border border-white/[0.07] text-text rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-faint",
          "focus:border-ember/50",
          error && "border-red-500/50",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
