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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">My Research Workspace</h2>
        <p className="text-xs text-[#6B6B67] mt-1">
          Organize saved papers and synthesized literature reports.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-2 border-b border-[#D9D7D0] pb-1">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'saved'
              ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40 shadow-glow-purple'
              : 'text-[#6B6B67] hover:text-[#171717] hover:bg-black/5'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Papers ({savedPapers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40 shadow-glow-purple'
              : 'text-[#6B6B67] hover:text-[#171717] hover:bg-black/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports ({reports.length})</span>
        </button>

      </div>

      {/* Tab Content Views */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="col-span-2 glass-panel rounded-2xl p-12 text-center text-xs text-[#6B6B67]">
              No saved papers yet. Click the bookmark icon on any paper to save it to your workspace.
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
              className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE] border border-[#1D4ED8]/30 text-[10px] font-mono text-[#1D4ED8]">
                  {report.type}
                </span>
                <span className="text-[11px] font-mono text-[#6B6B67]">{report.date}</span>
              </div>

              <h3 className="text-base font-bold text-[#171717] group-hover:text-[#1D4ED8] transition-colors leading-snug">
                {report.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-[#6B6B67] font-mono pt-3 border-t border-[#D9D7D0]">
                <span>{report.wordCount} words · {report.sections.length} sections</span>
                <ArrowUpRight className="w-4 h-4 text-[#171717]/40 group-hover:text-[#171717] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
