import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#101512] p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#6F9B83]/30 bg-[#16231D] text-[#6F9B83]">
        {icon || <Search className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#F5F7F3]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[#A5ADA7] leading-relaxed">{description}</p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0C100E] px-4 py-2 text-xs font-semibold text-[#F5F7F3] transition-colors hover:border-[#6F9B83]/40 hover:bg-[#141B17]"
        >
          <span>{actionText}</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#6F9B83]" />
        </button>
      )}
    </div>
  );
};
