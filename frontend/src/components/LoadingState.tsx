import React from 'react';
import { Loader2 } from 'lucide-react';
import { ResearchVisual } from './ResearchVisual';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  showOrb?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'AI Agents Processing Research...',
  subMessage = 'Synthesizing literature archives and cross-referencing findings...',
  showOrb = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
      {showOrb && (
        <ResearchVisual />
      )}

      <div className="flex items-center space-x-2 text-base font-semibold text-[#171717]">
        <Loader2 className="w-5 h-5 text-[#1D4ED8] animate-spin" />
        <span>{message}</span>
      </div>

      {subMessage && (
        <p className="text-xs text-[#6B6B67] max-w-md leading-relaxed">
          {subMessage}
        </p>
      )}

      {/* Shimmer skeleton bar */}
      <div className="w-64 h-1.5 rounded-full bg-black/5 overflow-hidden relative">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </div>
  );
};
