import { cn } from '@/lib/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'outline', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-4 py-1.5 text-sm',
        size === 'md' && 'px-6 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-3 text-base',
        variant === 'primary' && 'fire-bg text-bg hover:opacity-90',
        variant === 'outline' && 'border border-ember/50 text-gold hover:bg-ember/10 hover:border-ember',
        variant === 'ghost'   && 'text-muted hover:text-text hover:bg-white/5',
        variant === 'danger'  && 'border border-red-500/50 text-red-400 hover:bg-red-500/10',
        className,
      )}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : null}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
