import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing academic query...',
  subMessage = 'Connecting to scholarly APIs and organizing research insights...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#101512] p-12 text-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-[#6F9B83]" />
      <h3 className="mt-4 text-sm font-semibold text-[#F5F7F3]">{message}</h3>
      <p className="mt-1 max-w-sm text-xs text-[#737B76]">{subMessage}</p>
    </div>
  );
};
