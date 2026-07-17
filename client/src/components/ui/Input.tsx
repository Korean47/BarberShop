import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export function Input({ label, error, hint, icon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const descriptionId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-bold text-current">{label}</label>}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={`min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[var(--text)] outline-none transition placeholder:text-[#7A8285] focus:border-[var(--primary)] focus:ring-4 focus:ring-[#183A44]/10 ${icon ? 'pl-10' : ''} ${error ? 'border-[var(--error)]' : 'border-[var(--stone)]'} ${className}`}
          {...props}
        />
      </div>
      {error ? <p id={descriptionId} className="text-sm font-semibold text-[var(--error)]">{error}</p> : hint ? <p id={descriptionId} className="text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
