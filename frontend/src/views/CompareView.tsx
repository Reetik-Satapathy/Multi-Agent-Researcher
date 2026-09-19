import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileText
} from 'lucide-react';
import type { Paper, PaperComparison } from '../types/research';
import { ComparisonTable } from '../components/ComparisonTable';
import { LoadingState } from '../components/LoadingState';
import { aiService } from '../services/aiService';

interface CompareViewProps {
  comparedPapers: Paper[];
  allPapers: Paper[];
  onRemoveCompare: (paper: Paper) => void;
  onAddCompare: (paper: Paper) => void;
  onGenerateReport: (papers: Paper[]) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  comparedPapers,
  allPapers,
  onRemoveCompare,
  onAddCompare,
  onGenerateReport
}) => {
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const runComparison = async () => {
    if (comparedPapers.length < 2) return;
    setLoading(true);
    const data = await aiService.comparePapers(comparedPapers);
    setComparison(data);
    setLoading(false);
  };

  useEffect(() => {
    if (comparedPapers.length >= 2) {
      runComparison();
    } else {
      setComparison(null);
    }
  }, [comparedPapers]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">Compare Research Papers</h2>
          <p className="text-xs text-[#6B6B67] mt-1">
            Synthesize similarities, architectural variances, performance metrics, and unaddressed research gaps.
          </p>
        </div>

        {comparedPapers.length >= 2 && (
          <button
            onClick={() => onGenerateReport(comparedPapers)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report from Comparison</span>
          </button>
        )}
      </div>

      {/* Selected Papers Slot Bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#1D4ED8] uppercase tracking-wider font-semibold">
            Selected Papers ({comparedPapers.length} / 4)
          </span>
          {comparedPapers.length < 4 && (
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center space-x-1.5 text-xs text-[#1D4ED8] hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add paper to compare</span>
            </button>
          )}
        </div>

        {/* Paper Chips Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {comparedPapers.map((paper, idx) => (
            <div
              key={paper.id}
              className="p-3.5 rounded-xl bg-black/50 border border-[#1D4ED8]/30 flex items-start justify-between gap-2 relative group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#1D4ED8]">Paper 0{idx + 1}</span>
                <h4 className="text-xs font-bold text-[#171717] line-clamp-2 leading-snug">
                  {paper.title}
                </h4>
                <p className="text-[11px] text-[#6B6B67]">{paper.year} • {paper.journal}</p>
              </div>

              <button
                onClick={() => onRemoveCompare(paper)}
                className="p-1 rounded-lg text-[#6B6B67] hover:text-[#171717] hover:bg-black/[0.04] transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {comparedPapers.length < 4 && (
            <button
              onClick={() => setShowSelector(true)}
              className="p-4 rounded-xl border border-dashed border-[#C4C2BB] hover:border-[#1D4ED8]/50 flex flex-col items-center justify-center space-y-1 text-[#6B6B67] hover:text-[#171717] transition-colors min-h-[90px]"
            >
              <Plus className="w-5 h-5 text-[#1D4ED8]" />
              <span className="text-xs font-medium">Select Paper</span>
            </button>
          )}
        </div>

        {/* Paper Selector Modal / Drawer Dropdown */}
        {showSelector && (
          <div className="p-4 rounded-xl bg-black/80 border border-[#D9D7D0] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B6B67]">
              <span>Choose paper from library:</span>
              <button onClick={() => setShowSelector(false)}>
                <X className="w-4 h-4 text-[#171717]" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {allPapers
                .filter((p) => !comparedPapers.some((cp) => cp.id === p.id))
                .map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => {
                      onAddCompare(paper);
                      setShowSelector(false);
                    }}
                    className="p-2.5 rounded-lg bg-black/5 hover:bg-[#DBEAFE] text-left text-xs text-[#171717] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 transition-colors truncate"
                  >
                    <span className="font-semibold block truncate">{paper.title}</span>
                    <span className="text-[10px] text-[#6B6B67]">{paper.year} • {paper.area}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Engine Execution State */}
      {comparedPapers.length < 2 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
          <GitCompare className="w-10 h-10 text-[#1D4ED8] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#171717]">Select at least 2 papers to trigger AI comparison</h3>
          <p className="text-xs text-[#6B6B67] max-w-sm mx-auto">
            Choose publications from your search or saved library to compare methodologies, datasets, and performance benchmarks side by side.
          </p>
        </div>
      ) : loading ? (
        <LoadingState message="AI Agent Analyzing Cross-Paper Dynamics & Metrics..." />
      ) : comparison ? (
        <div className="space-y-8">
          {/* AI SYNTHETIC OVERVIEW */}
          <div className="glass-panel rounded-2xl p-6 border border-[#1D4ED8]/40 shadow-glow-purple space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-base font-bold text-[#171717] tracking-tight">AI Synthetic Cross-Paper Overview</h3>
            </div>
            <p className="text-sm text-[#171717] leading-relaxed font-sans">
              {comparison.overview}
            </p>
          </div>

          {/* SIMILARITIES vs DIFFERENCES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#171717] tracking-tight">Key Shared Similarities</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#171717]">
                {comparison.similarities.map((sim, idx) => (
                  <li key={idx} className="flex items-start space-x-2 p-3 rounded-xl bg-black/[0.03] border border-[#D9D7D0]">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="leading-relaxed">{sim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-bold text-[#171717] tracking-tight">Architectural & Empirical Differences</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#171717]">
                {comparison.differences.map((diff, idx) => (
                  <li key={idx} className="flex items-start space-x-2 p-3 rounded-xl bg-black/[0.03] border border-[#D9D7D0]">
                    <span className="text-[#1D4ED8] font-bold">•</span>
                    <span className="leading-relaxed">{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RESEARCH GAPS & UNEXPLORED PARADIGMS */}
          <div className="glass-panel rounded-2xl p-6 border border-[#1D4ED8]/30 space-y-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-base font-bold text-[#171717] tracking-tight">Identified Research Gaps & Open Questions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {comparison.researchGaps.map((gap, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F5F3EE] border border-[#D9D7D0] space-y-1.5">
                  <span className="text-[10px] font-mono text-[#1D4ED8]">GAP #{idx + 1}</span>
                  <p className="text-xs text-[#6B6B67] leading-relaxed">
                    {gap}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILED SIDE-BY-SIDE MATRIX TABLE */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#171717] tracking-tight">Detailed Comparative Metric Matrix</h3>
            <ComparisonTable papers={comparedPapers} metrics={comparison.comparisonTable} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
