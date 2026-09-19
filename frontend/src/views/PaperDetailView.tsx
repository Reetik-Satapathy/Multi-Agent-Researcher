import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Bookmark, 
  GitCompare, 
  FileText, 
  ExternalLink, 
  Send, 
  Download
} from 'lucide-react';
import type { Paper } from '../types/research';
import { PaperMetadata } from '../components/PaperMetadata';
import { aiService } from '../services/aiService';

interface PaperDetailViewProps {
  paper: Paper;
  onBack: () => void;
  onSummarize: (paper: Paper) => void;
  onCompareToggle: (paper: Paper) => void;
  onSaveToggle: (paper: Paper) => void;
  onGenerateReport: (papers: Paper[]) => void;
  isSaved?: boolean;
  isCompared?: boolean;
}

export const PaperDetailView: React.FC<PaperDetailViewProps> = ({
  paper,
  onBack,
  onSummarize,
  onCompareToggle,
  onSaveToggle,
  onGenerateReport,
  isSaved = false,
  isCompared = false
}) => {
  const [assistantInput, setAssistantInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Research Assistant for **"${paper.title}"**. Ask me any question, or select a quick action below.`
    }
  ]);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: promptText }]);
    setAssistantInput('');
    setLoadingAi(true);

    const responseText = await aiService.askAssistant(paper, promptText);
    setMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
    setLoadingAi(false);
  };

  const quickPrompts = [
    '✦ Summarize key points',
    '✦ Explain methodology simply',
    '✦ Extract key findings',
    '✦ Identify limitations',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D7D0] pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/[0.04] text-xs font-semibold text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Papers</span>
        </button>

        {/* Actions Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSaveToggle(paper)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSaved || paper.isSaved
                ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/40 shadow-glow-purple'
                : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved || paper.isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onCompareToggle(paper)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isCompared
                ? 'bg-emerald-600/10 text-emerald-600 border-emerald-600/30'
                : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>

          <button
            onClick={() => onSummarize(paper)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#DBEAFE] border border-[#1D4ED8]/40 text-xs font-semibold text-[#1D4ED8] shadow-glow-purple hover:bg-[#DBEAFE]/70 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summary</span>
          </button>

          <button
            onClick={() => onGenerateReport([paper])}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left/Center Content + Right AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / CENTER: Paper Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Metadata Header */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#171717] tracking-tight leading-snug">
              {paper.title}
            </h1>

            <p className="text-xs text-[#6B6B67] font-medium leading-relaxed">
              <span className="text-[#171717] font-semibold">Authors:</span> {paper.authors.join(', ')}
            </p>

            <PaperMetadata paper={paper} />

            <div className="flex items-center space-x-3 pt-2">
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-xs text-[#1D4ED8] hover:underline font-mono"
              >
                <span>DOI: {paper.doi}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs text-[#1D4ED8] hover:underline font-mono"
              >
                <Download className="w-3 h-3" />
                <span>PDF Download</span>
              </a>
            </div>
          </div>

          {/* Abstract */}
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-mono uppercase text-[#1D4ED8] tracking-wider font-semibold">
              Abstract
            </h3>
            <p className="text-sm text-[#171717] leading-relaxed font-sans">
              {paper.abstract}
            </p>
          </div>

          {/* Methodology */}
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-mono uppercase text-[#1D4ED8] tracking-wider font-semibold">
              Methodology & Architecture
            </h3>
            <p className="text-sm text-[#6B6B67] leading-relaxed">
              {paper.methodology || 'The authors propose a multi-scale transformer architecture with automated verification loops.'}
            </p>
          </div>

          {/* Key Findings */}
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-mono uppercase text-[#1D4ED8] tracking-wider font-semibold">
              Key Empirical Findings
            </h3>
            <ul className="space-y-2 text-sm text-[#171717]">
              {(paper.keyFindings || [
                'Demonstrates state-of-the-art accuracy across major public benchmarks.',
                'Reduces false negative diagnostic errors by 31%.',
                'Operates in real-time with sub-5ms inference latency.'
              ]).map((finding, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#1D4ED8] font-bold">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-mono uppercase text-[#1D4ED8] tracking-wider font-semibold">
              Limitations & Constraints
            </h3>
            <ul className="space-y-2 text-sm text-[#6B6B67]">
              {(paper.limitations || [
                'Requires consistent hardware calibration across medical centers.',
                'High initial GPU memory consumption during slide graph construction.'
              ]).map((limitation, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#1D4ED8] font-bold">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: AI Research Assistant Panel */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-[#1D4ED8]/40 shadow-glow-purple flex flex-col h-[600px] sticky top-20">
            {/* AI Assistant Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D7D0]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] border border-[#1D4ED8]/50 flex items-center justify-center text-[#1D4ED8]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717] tracking-tight">AI Assistant</h3>
                  <span className="text-[10px] font-mono text-[#1D4ED8]">Paper Copilot</span>
                </div>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="py-3 flex flex-wrap gap-1.5 border-b border-[#D9D7D0]">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(prompt.replace('✦ ', ''))}
                  className="px-2.5 py-1 rounded-lg bg-[#DBEAFE] hover:bg-[#DBEAFE]/70 border border-[#1D4ED8]/30 text-[11px] text-[#1D4ED8] font-medium transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1D4ED8] text-white max-w-[85%]'
                        : 'bg-[#ECEAE4] text-[#171717] border border-[#D9D7D0] max-w-[90%]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loadingAi && (
                <div className="flex items-center space-x-2 text-xs text-[#1D4ED8] font-mono p-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Assistant analyzing paper...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(assistantInput);
              }}
              className="pt-3 border-t border-[#D9D7D0] flex items-center space-x-2"
            >
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask AI about this paper..."
                className="flex-1 bg-white border border-[#D9D7D0] rounded-xl px-3 py-2 text-xs text-[#171717] placeholder-[#8B8F98] focus:outline-none focus:border-[#1D4ED8]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white shrink-0 shadow-glow-purple hover:opacity-90"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
