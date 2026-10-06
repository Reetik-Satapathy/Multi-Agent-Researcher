import React from 'react';
import { Calendar, BookOpen, Quote, Lock, Unlock } from 'lucide-react';
import type { Paper } from '../types/research';

interface PaperMetadataProps {
  paper: Paper;
  className?: string;
}

export const PaperMetadata: React.FC<PaperMetadataProps> = ({ paper, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#A5ADA7] ${className}`}>
      {/* Year */}
      <div className="flex items-center gap-1 rounded border border-white/[0.08] bg-[#0C100E] px-2 py-0.5">
        <Calendar className="h-3 w-3 text-[#6F9B83]" />
        <span>{paper.year}</span>
      </div>

      {/* Journal */}
      {paper.journal && (
        <div className="flex items-center gap-1 rounded border border-white/[0.08] bg-[#0C100E] px-2 py-0.5 truncate max-w-[200px]">
          <BookOpen className="h-3 w-3 text-[#6F9B83]" />
          <span className="truncate">{paper.journal}</span>
        </div>
      )}

      {/* Citations */}
      <div className="flex items-center gap-1 rounded border border-white/[0.08] bg-[#0C100E] px-2 py-0.5">
        <Quote className="h-3 w-3 text-[#B89B62]" />
        <span>{paper.citations} citations</span>
      </div>

      {/* Open Access */}
      <div className={`flex items-center gap-1 rounded border px-2 py-0.5 ${
        paper.openAccess 
          ? 'border-[#6F9B83]/30 bg-[#16231D] text-[#6F9B83]' 
          : 'border-white/[0.08] bg-[#0C100E] text-[#737B76]'
      }`}>
        {paper.openAccess ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
        <span>{paper.openAccess ? 'Open Access' : 'Subscription'}</span>
      </div>

      {/* Area Badge */}
      {paper.area && (
        <div className="flex items-center gap-1 rounded border border-[#6F9B83]/20 bg-[#16231D]/40 px-2 py-0.5 text-[#6F9B83]">
          <span>{paper.area}</span>
        </div>
      )}
    </div>
  );
};
