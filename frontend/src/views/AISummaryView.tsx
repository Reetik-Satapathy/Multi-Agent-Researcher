import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Zap, 
  HelpCircle, 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';
import type { Paper, PaperSummary } from '../types/research';
import { ResearchVisual } from '../components/ResearchVisual';
import { LoadingState } from '../components/LoadingState';
import { aiService } from '../services/aiService';

interface AISummaryViewProps {
  paper: Paper;
  onBack: () => void;
  onGenerateReport: (papers: Paper[]) => void;
}

export const AISummaryView: React.FC<AISummaryViewProps> = ({
  paper,
  onBack,
  onGenerateReport
}) => {
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'standard' | 'shorter' | 'simple'>('standard');

  const loadSummary = async () => {
    setLoading(true);
    const data = await aiService.generateSummary(paper);
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, [paper]);

  const handleAction = async (action: 'regenerate' | 'shorter' | 'simple') => {
    if (!summary) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (action === 'shorter') {
      setMode('shorter');
    } else if (action === 'simple') {
      setMode('simple');
    } else {
      setMode('standard');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-[#D9D7D0] pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/[0.04] text-xs font-semibold text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Paper</span>
        </button>

        {/* Ambient Orb Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DBEAFE] border border-[#1D4ED8]/30 text-xs text-[#1D4ED8]">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI Research Engine</span>
        </div>
      </div>

      {/* Title & Paper Reference */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#DBEAFE]/70 text-[#1D4ED8] text-[10px] font-mono border border-[#1D4ED8]/30">
              AI SUMMARY WORKSPACE
            </span>
            <span className="text-xs text-[#6B6B67] font-mono">{paper.year} • {paper.journal}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-[#171717] tracking-tight leading-snug">
            {paper.title}
          </h1>

          <p className="text-xs text-[#6B6B67]">
            By {paper.authors.join(', ')}
          </p>
        </div>

        <div className="shrink-0 hidden md:block">
          <ResearchVisual className="!h-14 !w-14" />
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-panel rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAction('regenerate')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/[0.04] border border-[#D9D7D0] text-xs text-[#171717] font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={() => handleAction('shorter')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              mode === 'shorter'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/40'
                : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Make Shorter</span>
          </button>

          <button
            onClick={() => handleAction('simple')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              mode === 'simple'
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/40'
                : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Explain Simply</span>
          </button>
        </div>

        <button
          onClick={() => onGenerateReport([paper])}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Summary Content Blocks */}
      {loading ? (
        <LoadingState message="Generating AI Synthesis & Section Breakdown..." />
      ) : summary ? (
        <div className="space-y-6">
          {/* TL;DR BOX */}
          <div className="glass-panel rounded-2xl p-6 border border-[#1D4ED8]/40 shadow-glow-purple space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-base font-bold text-[#171717] tracking-tight">TL;DR Executive Synthesis</h3>
            </div>
            <p className="text-sm md:text-base text-[#171717] leading-relaxed font-sans font-medium">
              {mode === 'shorter' 
                ? summary.tldr.slice(0, 120) + '...' 
                : mode === 'simple'
                ? `In plain terms: This paper provides a smart AI method to test and improve research results automatically.`
                : summary.tldr}
            </p>
          </div>

          {/* KEY FINDINGS GRID */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-base font-bold text-[#171717] tracking-tight">Key Empirical Findings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.keyFindings.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F5F3EE] border border-[#D9D7D0] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#1D4ED8] font-semibold">Claim #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 border border-emerald-500/30">
                      {(item.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-[#171717] leading-relaxed">
                    {item.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* METHODOLOGY & RESULTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Methodology Block */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-bold text-[#171717] tracking-tight">Methodology Breakdown</h3>
              </div>
              <div className="space-y-3 text-xs text-[#6B6B67]">
                <div className="p-3 rounded-xl bg-black/[0.03] border border-[#D9D7D0] space-y-1">
                  <span className="text-[#1D4ED8] font-mono font-semibold block">Architecture</span>
                  <span className="text-[#171717]">{summary.methodology.architecture}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.03] border border-[#D9D7D0] space-y-1">
                  <span className="text-[#1D4ED8] font-mono font-semibold block">Dataset & Training</span>
                  <span className="text-[#171717]">{summary.methodology.datasetSize} ({summary.methodology.trainingHours})</span>
                </div>
              </div>
            </div>

            {/* Results Metrics Table */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#171717] tracking-tight">Quantitative Results</h3>
              </div>
              <div className="space-y-2">
                {summary.results.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/[0.03] border border-[#D9D7D0] text-xs">
                    <span className="text-[#6B6B67] font-medium">{res.metric}</span>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-[#171717]/60 line-through text-[11px]">{res.baseline}</span>
                      <span className="text-[#171717] font-bold">{res.value}</span>
                      <span className="text-emerald-600 font-semibold">{res.improvement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LIMITATIONS & TAKEAWAYS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#171717] tracking-tight">Identified Limitations</h3>
              </div>
              <ul className="space-y-2 text-xs text-[#6B6B67]">
                {summary.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-bold text-[#171717] tracking-tight">Key Research Takeaways</h3>
              </div>
              <ul className="space-y-2 text-xs text-[#171717]">
                {summary.keyTakeaways.map((take, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-[#1D4ED8] font-bold">•</span>
                    <span>{take}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
