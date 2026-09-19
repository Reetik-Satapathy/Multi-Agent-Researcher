import React, { useEffect, useState } from 'react';
import { 
  FolderKanban, 
  Bookmark, 
  FileText, 
  Clock, 
  Plus, 
  Search, 
  ArrowUpRight
} from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { PaperCard } from '../components/PaperCard';
import type { Project, Paper, ResearchReport } from '../types/research';
import { workspaceService } from '../services/workspaceService';

interface MyResearchViewProps {
  projects: Project[];
  savedPapers: Paper[];
  reports: ResearchReport[];
  onOpenProject: (project: Project) => void;
  onOpenPaper: (paper: Paper) => void;
  onSummarizePaper: (paper: Paper) => void;
  onCompareToggle: (paper: Paper) => void;
  onSaveToggle: (paper: Paper) => void;
  onOpenReport: (report: ResearchReport) => void;
  onNewProject: () => void;
  comparedPapers: Paper[];
  initialSection?: 'projects' | 'saved' | 'reports' | 'history';
}

export const MyResearchView: React.FC<MyResearchViewProps> = ({
  projects,
  savedPapers,
  reports,
  onOpenProject,
  onOpenPaper,
  onSummarizePaper,
  onCompareToggle,
  onSaveToggle,
  onOpenReport,
  onNewProject,
  comparedPapers,
  initialSection = 'projects',
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'saved' | 'reports' | 'history'>(initialSection);

  useEffect(() => {
    setActiveTab(initialSection);
  }, [initialSection]);
  const recentSearches = workspaceService.getRecentSearches();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">My Research Workspace</h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Organize publications, saved projects, synthesized literature reports, and search history.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center space-x-2 border-b border-[#D9D7D0] pb-1">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'projects'
              ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40 shadow-glow-purple'
              : 'text-[#6B6B67] hover:text-[#171717] hover:bg-black/5'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

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

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/40 shadow-glow-purple'
              : 'text-[#6B6B67] hover:text-[#171717] hover:bg-black/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Research History</span>
        </button>
      </div>

      {/* Tab Content Views */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} onOpen={onOpenProject} />
          ))}
        </div>
      )}

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

      {activeTab === 'history' && (
        <div className="glass-panel rounded-2xl p-6 space-y-3 max-w-xl">
          <h3 className="text-xs font-mono uppercase text-[#1D4ED8] tracking-wider font-semibold">
            Recent AI Prompt & Search Logs
          </h3>
          <div className="divide-y divide-[#D9D7D0] text-xs text-[#171717] font-mono">
            {recentSearches.map((query, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-[#6B6B67]" />
                  <span>{query}</span>
                </div>
                <span className="text-[10px] text-[#6B6B67]">Verified</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
