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
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-current">{label}</label>}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b847f]">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={`min-h-12 w-full rounded-xl border bg-white px-4 text-base text-[#17211d] outline-none transition placeholder:text-[#8b928e] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : 'border-[#17211d]/15'} ${className}`}
          {...props}
        />
      </div>
      {error ? <p id={descriptionId} className="text-sm text-red-700">{error}</p> : hint ? <p id={descriptionId} className="text-xs text-[#657069]">{hint}</p> : null}
    </div>
  );
}
