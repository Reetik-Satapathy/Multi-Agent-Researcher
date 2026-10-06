import React, { useState } from 'react';
import { ArrowUpRight, Bookmark, FileText } from 'lucide-react';
import { PaperCard } from '../components/PaperCard';
import type { Paper, ResearchReport } from '../types/research';

interface MyResearchViewProps {
  savedPapers: Paper[];
  reports: ResearchReport[];
  onOpenPaper: (paper: Paper) => void;
  onSummarizePaper: (paper: Paper) => void;
  onCompareToggle: (paper: Paper) => void;
  onSaveToggle: (paper: Paper) => void;
  onOpenReport: (report: ResearchReport) => void;
  comparedPapers: Paper[];
}

export const MyResearchView: React.FC<MyResearchViewProps> = ({
  savedPapers,
  reports,
  onOpenPaper,
  onSummarizePaper,
  onCompareToggle,
  onSaveToggle,
  onOpenReport,
  comparedPapers,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'reports'>('saved');

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#F5F7F3]">My Research Library</h2>
        <p className="mt-1 text-xs text-[#A5ADA7]">
          Organize saved academic papers and synthesized research reports.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'saved'
              ? 'border border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
              : 'border border-transparent text-[#A5ADA7] hover:bg-[#101512] hover:text-[#F5F7F3]'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5 text-[#6F9B83]" />
          <span>Saved Papers ({savedPapers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'reports'
              ? 'border border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
              : 'border border-transparent text-[#A5ADA7] hover:bg-[#101512] hover:text-[#F5F7F3]'
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-[#6F9B83]" />
          <span>Reports ({reports.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedPapers.length > 0 ? (
            savedPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onOpen={onOpenPaper}
                onSummarize={onSummarizePaper}
                onCompareToggle={onCompareToggle}
                onSaveToggle={onSaveToggle}
                isCompared={comparedPapers.some((p) => p.id === paper.id)}
                isSaved={true}
              />
            ))
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-12 text-center text-xs text-[#737B76]">
              No saved papers yet. Click the bookmark icon on any paper to save it to your library.
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => onOpenReport(report)}
              className="group cursor-pointer rounded-xl border border-white/[0.08] bg-[#101512] p-5 space-y-3 transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-[#6F9B83]/20 bg-[#16231D] px-2 py-0.5 font-mono text-[10px] text-[#6F9B83]">
                  {report.type}
                </span>
                <span className="font-mono text-[11px] text-[#737B76]">{report.date}</span>
              </div>

              <h3 className="text-sm font-semibold text-[#F5F7F3] leading-snug group-hover:text-[#6F9B83] transition-colors">
                {report.title}
              </h3>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-mono text-[#A5ADA7]">
                <span>{report.wordCount} words · {report.sections.length} sections</span>
                <ArrowUpRight className="h-4 w-4 text-[#737B76] group-hover:text-[#F5F7F3] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
