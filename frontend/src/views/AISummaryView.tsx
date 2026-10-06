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
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1.5 text-xs text-[#A5ADA7] transition-colors hover:border-white/[0.16] hover:text-[#F5F7F3]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Paper</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border border-[#6F9B83]/30 bg-[#16231D] px-3 py-1 text-xs text-[#6F9B83]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Research Summary</span>
        </div>
      </div>

      {/* Paper Title Header */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#6F9B83]">
          <span>AI SUMMARY WORKSPACE</span>
          <span>·</span>
          <span>{paper.year}</span>
          {paper.journal && <span>· {paper.journal}</span>}
        </div>

        <h1 className="text-xl font-bold tracking-tight text-[#F5F7F3] leading-snug">
          {paper.title}
        </h1>

        <p className="text-xs text-[#A5ADA7]">
          Authors: {paper.authors.join(', ')}
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0C100E] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction('regenerate')}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#101512] px-3 py-1.5 text-xs text-[#F5F7F3] transition-colors hover:border-white/[0.16]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#6F9B83]" />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('shorter')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              mode === 'shorter'
                ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#101512] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-[#B89B62]" />
            <span>Make Shorter</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('simple')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              mode === 'simple'
                ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#101512] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#6F9B83]" />
            <span>Explain Simply</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onGenerateReport([paper])}
          className="flex items-center gap-1.5 rounded-lg bg-[#315C4B] px-4 py-1.5 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C]"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Structured Summary Sections */}
      {loading ? (
        <LoadingState message="Generating Structured AI Summary..." />
      ) : summary ? (
        <div className="space-y-5">
          {/* Executive TL;DR Section */}
          <div className="rounded-xl border border-[#6F9B83]/30 bg-[#101512] p-6 space-y-2 border-l-4 border-l-[#6F9B83]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F9B83]">
              <Zap className="h-4 w-4" />
              <span>Executive TL;DR</span>
            </div>
            <p className="text-xs sm:text-sm text-[#F5F7F3] leading-relaxed">
              {mode === 'shorter' 
                ? summary.tldr.slice(0, 130) + '...' 
                : mode === 'simple'
                ? `In plain terms: This paper provides an automated AI framework to test, verify, and improve research results efficiently.`
                : summary.tldr}
            </p>
          </div>

          {/* Key Empirical Findings Section */}
          <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F9B83]">
              <Award className="h-4 w-4" />
              <span>Key Empirical Findings</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {summary.keyFindings.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-white/[0.06] bg-[#0C100E] p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#6F9B83]">Finding #{idx + 1}</span>
                    <span className="rounded bg-[#16231D] px-2 py-0.5 text-[#6F9B83] border border-[#6F9B83]/20">
                      {(item.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-[#F5F7F3] leading-relaxed">
                    {item.finding}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology & Results Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F9B83]">
                <BookOpen className="h-4 w-4" />
                <span>Methodology & Architecture</span>
              </div>
              <div className="space-y-2 text-xs text-[#A5ADA7]">
                <div className="rounded-lg border border-white/[0.06] bg-[#0C100E] p-3 space-y-1">
                  <span className="text-[#6F9B83] font-mono font-medium block">Architecture</span>
                  <span className="text-[#F5F7F3]">{summary.methodology.architecture}</span>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-[#0C100E] p-3 space-y-1">
                  <span className="text-[#6F9B83] font-mono font-medium block">Dataset & Compute</span>
                  <span className="text-[#F5F7F3]">{summary.methodology.datasetSize} ({summary.methodology.trainingHours})</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F9B83]">
                <CheckCircle className="h-4 w-4" />
                <span>Quantitative Benchmarks</span>
              </div>
              <div className="space-y-2">
                {summary.results.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0C100E] p-3 text-xs">
                    <span className="text-[#A5ADA7]">{res.metric}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[#737B76] line-through text-[11px]">{res.baseline}</span>
                      <span className="text-[#F5F7F3] font-semibold">{res.value}</span>
                      <span className="text-[#6F9B83]">{res.improvement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Limitations & Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3 border-l-2 border-l-[#B89B62]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B89B62]">
                <AlertTriangle className="h-4 w-4" />
                <span>Identified Limitations</span>
              </div>
              <ul className="space-y-2 text-xs text-[#A5ADA7]">
                {summary.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#B89B62]">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3 border-l-2 border-l-[#6F9B83]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F9B83]">
                <Sparkles className="h-4 w-4" />
                <span>Key Research Takeaways</span>
              </div>
              <ul className="space-y-2 text-xs text-[#F5F7F3]">
                {summary.keyTakeaways.map((take, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#6F9B83]">•</span>
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
