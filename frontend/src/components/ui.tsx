import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-[1.7rem] font-light tracking-tight text-[#F5F7F3] sm:text-[1.85rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm leading-relaxed text-[#A5ADA7]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6F9B83]">
      {children}
    </h2>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';

export function Button({
  variant = 'secondary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' && 'bg-[#315C4B] text-[#F5F7F3] hover:bg-[#3D705C]',
        variant === 'secondary' &&
          'border border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-[#6F9B83]/35 hover:bg-[#141B17] hover:text-[#F5F7F3]',
        variant === 'ghost' && 'px-2 text-[#A5ADA7] hover:bg-[#101512] hover:text-[#F5F7F3]',
        variant === 'accent' &&
          'border border-[#6F9B83]/35 bg-[#16231D] text-[#F5F7F3] hover:border-[#6F9B83]/55',
        className,
      )}
      {...props}
    />
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-sm text-[#F5F7F3] outline-none placeholder:text-[#737B76] focus:border-[#6F9B83]/50',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'rounded-md border border-white/[0.08] bg-[#0C100E] px-2 py-1 text-xs text-[#F5F7F3] outline-none focus:border-[#6F9B83]/50',
        className,
      )}
      {...props}
    />
  );
}
