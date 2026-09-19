import React from 'react';
import { Calendar, BookOpen, Quote, Lock, Unlock } from 'lucide-react';
import type { Paper } from '../types/research';

interface PaperMetadataProps {
  paper: Paper;
  className?: string;
}

export const PaperMetadata: React.FC<PaperMetadataProps> = ({ paper, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs font-mono text-[#6B6B67] ${className}`}>
      {/* Year */}
      <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-black/5 border border-[#D9D7D0]">
        <Calendar className="w-3 h-3 text-[#1D4ED8]" />
        <span>{paper.year}</span>
      </div>

      {/* Journal/Venue */}
      <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-black/5 border border-[#D9D7D0] truncate max-w-[200px]">
        <BookOpen className="w-3 h-3 text-[#1D4ED8]" />
        <span className="truncate">{paper.journal}</span>
      </div>

      {/* Citations */}
      <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-black/5 border border-[#D9D7D0]">
        <Quote className="w-3 h-3 text-amber-600" />
        <span>{paper.citations} citations</span>
      </div>

      {/* Open Access */}
      <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border ${
        paper.openAccess 
          ? 'bg-emerald-600/10 text-emerald-600 border-emerald-500/30' 
          : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0]'
      }`}>
        {paper.openAccess ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
        <span>{paper.openAccess ? 'Open Access' : 'Subscription'}</span>
      </div>

      {/* Area Badge */}
      <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/30">
        <span>{paper.area}</span>
      </div>
    </div>
  );
};
