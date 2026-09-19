import React, { useState } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  GitCompare, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp,
  Check
} from 'lucide-react';
import type { Paper } from '../types/research';
import { PaperMetadata } from './PaperMetadata';

interface PaperCardProps {
  paper: Paper;
  onOpen: (paper: Paper) => void;
  onSummarize: (paper: Paper) => void;
  onCompareToggle: (paper: Paper) => void;
  onSaveToggle: (paper: Paper) => void;
  isCompared?: boolean;
  isSaved?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onOpen,
  onSummarize,
  onCompareToggle,
  onSaveToggle,
  isCompared = false,
  isSaved = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-4 group">
      {/* Top Header: Title & Save Icon */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 
            onClick={() => onOpen(paper)}
            className="text-lg md:text-xl font-bold text-[#171717] group-hover:text-[#1D4ED8] transition-colors cursor-pointer leading-snug tracking-tight"
          >
            {paper.title}
          </h3>

          <button
            onClick={() => onSaveToggle(paper)}
            className={`p-2 rounded-xl border transition-all shrink-0 ${
              isSaved || paper.isSaved
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/50 shadow-glow-purple'
                : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717] hover:bg-black/[0.04]'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Paper'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved || paper.isSaved ? 'fill-[#1D4ED8]' : ''}`} />
          </button>
        </div>

        {/* Authors */}
        <p className="text-xs text-[#6B6B67] mb-3 font-medium">
          {paper.authors.join(' • ')}
        </p>

        {/* Metadata Badges */}
        <PaperMetadata paper={paper} className="mb-4" />

        {/* Abstract Snippet */}
        <div className="relative text-sm text-[#6B6B67] leading-relaxed">
          <p className={expanded ? '' : 'line-clamp-3'}>
            {paper.abstract}
          </p>
          {paper.abstract.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center space-x-1 text-xs text-[#1D4ED8] hover:underline font-medium"
            >
              <span>{expanded ? 'Show less' : 'Read full abstract'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="pt-4 border-t border-[#D9D7D0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {/* AI Summary Action */}
          <button
            onClick={() => onSummarize(paper)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#DBEAFE] hover:bg-[#DBEAFE]/70 border border-[#1D4ED8]/40 text-xs font-semibold text-[#1D4ED8] transition-all shadow-glow-purple"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summary</span>
          </button>

          {/* Add to Compare Action */}
          <button
            onClick={() => onCompareToggle(paper)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isCompared
                ? 'bg-emerald-600/10 text-emerald-600 border-emerald-600/30'
                : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717] hover:bg-black/[0.04]'
            }`}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
            <span>{isCompared ? 'Added to Compare' : 'Compare'}</span>
          </button>
        </div>

        {/* Open Details Action */}
        <button
          onClick={() => onOpen(paper)}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-[#171717] text-xs font-semibold transition-all ml-auto"
        >
          <span>Open</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
