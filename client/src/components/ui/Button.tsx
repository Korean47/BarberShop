import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

const variants = {
  primary: 'bg-[var(--brand)] text-white shadow-sm hover:bg-[#0b3f4c] hover:shadow-md',
  secondary: 'bg-[var(--brand-soft)] text-[#17313a] hover:bg-[#e7b437]',
  outline: 'border border-[#17313a]/20 bg-white text-[#17313a] hover:bg-[#17313a]/5',
  ghost: 'bg-transparent text-current hover:bg-black/5',
  danger: 'border border-red-600/20 bg-red-50 text-red-700 hover:bg-red-100',
};
const sizes = { sm: 'min-h-10 px-3 text-sm', md: 'min-h-12 px-5 text-sm', lg: 'min-h-[52px] px-6 text-base' };

export function Button({ variant = 'primary', size = 'md', loading = false, icon, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[.98] ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
