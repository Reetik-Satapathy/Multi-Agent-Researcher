import { useState } from 'react';
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
    <div className="group rounded-xl border border-white/[0.08] bg-[#101512] p-5 transition-all duration-150 hover:border-[#6F9B83]/30 hover:bg-[#141B17]">
      {/* Title & Category Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 
            onClick={() => onOpen(paper)}
            className="cursor-pointer text-base font-semibold text-[#F5F7F3] leading-snug tracking-tight transition-colors group-hover:text-[#6F9B83]"
          >
            {paper.title}
          </h3>
          <span className="shrink-0 rounded-md border border-white/[0.06] bg-[#0C100E] px-2 py-0.5 font-mono text-[10px] text-[#A5ADA7]">
            {paper.year}
          </span>
        </div>

        {/* Authors & Journal */}
        <p className="text-xs text-[#A5ADA7]">
          {paper.authors.join(' · ')} {paper.journal ? `— ${paper.journal}` : ''}
        </p>

        {/* Paper Badges / Metadata */}
        <div className="pt-1">
          <PaperMetadata paper={paper} />
        </div>

        {/* Abstract Snippet */}
        <div className="pt-2 text-xs leading-relaxed text-[#A5ADA7]">
          <p className={expanded ? '' : 'line-clamp-3'}>
            {paper.abstract}
          </p>
          {paper.abstract.length > 180 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-[11px] text-[#6F9B83] hover:underline font-medium"
            >
              <span>{expanded ? 'Collapse abstract' : 'Read full abstract'}</span>
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Action */}
          <button
            type="button"
            onClick={() => onSaveToggle(paper)}
            aria-pressed={isSaved || Boolean(paper.isSaved)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
              isSaved || paper.isSaved
                ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${isSaved || paper.isSaved ? 'fill-[#6F9B83] text-[#6F9B83]' : 'text-[#737B76]'}`} />
            <span>{isSaved || paper.isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* AI Summary Action */}
          <button
            type="button"
            onClick={() => onSummarize(paper)}
            className="flex items-center gap-1.5 rounded-lg border border-[#6F9B83]/30 bg-[#16231D]/60 px-2.5 py-1 text-xs text-[#6F9B83] transition-colors hover:bg-[#315C4B]/30 hover:text-[#F5F7F3]"
          >
            <Sparkles className="h-3 w-3 text-[#6F9B83]" />
            <span>AI Summary</span>
          </button>

          {/* Compare Action */}
          <button
            type="button"
            onClick={() => onCompareToggle(paper)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
              isCompared
                ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            {isCompared ? <Check className="h-3 w-3 text-[#6F9B83]" /> : <GitCompare className="h-3 w-3 text-[#737B76]" />}
            <span>{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>
        </div>

        {/* Open Details Action */}
        <button
          type="button"
          onClick={() => onOpen(paper)}
          className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1 text-xs font-medium text-[#F5F7F3] transition-colors hover:border-[#6F9B83]/40 hover:bg-[#141B17]"
        >
          <span>Open</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#737B76]" />
        </button>
      </div>
    </div>
  );
};
