import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Research Items Found',
  description = 'Try adjusting your search filters or start exploring new papers using our AI agent engine.',
  actionText,
  onAction,
  icon: Icon = FolderOpen
}) => {
  return (
    <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-[#DBEAFE] border border-[#1D4ED8]/30 flex items-center justify-center text-[#1D4ED8] shadow-glow-purple">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-[#171717] tracking-tight">{title}</h3>

      <p className="text-xs text-[#6B6B67] leading-relaxed max-w-xs">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
