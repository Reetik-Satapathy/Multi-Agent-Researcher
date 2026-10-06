import React, { useEffect, useState } from 'react';
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
import { readLocalStorage, writeLocalStorage } from '../hooks/useLocalStorageState';

interface PaperChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

function initialPaperMessages(paper: Paper): PaperChatMessage[] {
  return readLocalStorage(`paper-chat-v1-${encodeURIComponent(paper.id)}`, [{
    sender: 'ai',
    text: `Hello! I am your AI Research Assistant for **"${paper.title}"**. Ask me any question, or select a quick action below.`
  }]);
}

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
  const [messages, setMessages] = useState<PaperChatMessage[]>(() => initialPaperMessages(paper));
  const [chatPaperId, setChatPaperId] = useState(paper.id);
  const [loadingAi, setLoadingAi] = useState(false);
  const [assistantError, setAssistantError] = useState('');

  useEffect(() => {
    if (chatPaperId !== paper.id) {
      setMessages(initialPaperMessages(paper));
      setChatPaperId(paper.id);
    }
    setAssistantInput('');
    setAssistantError('');
  }, [paper.id, paper.title, chatPaperId]);

  useEffect(() => {
    if (chatPaperId === paper.id) {
      writeLocalStorage(`paper-chat-v1-${encodeURIComponent(paper.id)}`, messages);
    }
  }, [chatPaperId, messages, paper.id]);

  const handleSendPrompt = async (promptText: string) => {
    const question = promptText.trim();
    if (!question || loadingAi) return;

    const history = messages
      .filter((message) => message.sender !== 'ai' || !message.text.startsWith('Hello! I am your AI Research Assistant'))
      .map((message) => ({
        role: message.sender === 'ai' ? 'assistant' as const : 'user' as const,
        content: message.text,
      }));
    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setAssistantInput('');
    setLoadingAi(true);
    setAssistantError('');
    try {
      const responseText = await aiService.askAssistant(paper, question, history);
      setMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
    } catch (caught) {
      setAssistantError(caught instanceof Error ? caught.message : 'The paper assistant request failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  const quickPrompts = [
    '✦ Summarize key points',
    '✦ Explain methodology simply',
    '✦ Extract key findings',
    '✦ Identify limitations',
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Navigation & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1.5 text-xs text-[#A5ADA7] transition-colors hover:border-white/[0.16] hover:text-[#F5F7F3]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Papers</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSaveToggle(paper)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              isSaved
                ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5 text-[#6F9B83]" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => onCompareToggle(paper)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              isCompared
                ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5 text-[#6F9B83]" />
            <span>{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSummarize(paper)}
            className="flex items-center gap-1.5 rounded-lg border border-[#6F9B83]/30 bg-[#16231D]/60 px-3 py-1.5 text-xs text-[#6F9B83] transition-colors hover:bg-[#315C4B]/30 hover:text-[#F5F7F3]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#6F9B83]" />
            <span>AI Summary</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateReport([paper])}
            className="flex items-center gap-1.5 rounded-lg bg-[#315C4B] px-3 py-1.5 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C]"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Main Column Layout: Reading View + Right AI Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Academic Reading Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F5F7F3] leading-snug">
              {paper.title}
            </h1>

            <p className="text-xs text-[#A5ADA7]">
              <span className="text-[#F5F7F3] font-medium">Authors:</span> {paper.authors.join(', ')}
            </p>

            <PaperMetadata paper={paper} />

            <div className="flex items-center gap-4 pt-2 text-xs font-mono text-[#6F9B83]">
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <span>DOI: {paper.doi}</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Download className="h-3 w-3" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          {/* Abstract */}
          <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6F9B83] font-semibold">
              Abstract
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F7F3] leading-relaxed">
              {paper.abstract}
            </p>
          </div>

          {/* Methodology */}
          <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6F9B83] font-semibold">
              Methodology & Architecture
            </h3>
            <p className="text-xs sm:text-sm text-[#A5ADA7] leading-relaxed">
              {paper.methodology || 'The authors propose a multi-scale transformer architecture with automated verification loops.'}
            </p>
          </div>

          {/* Key Empirical Findings */}
          <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6F9B83] font-semibold">
              Key Empirical Findings
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#F5F7F3]">
              {(paper.keyFindings || [
                'Demonstrates state-of-the-art accuracy across major public benchmarks.',
                'Reduces false negative diagnostic errors by 31%.',
                'Operates in real-time with sub-5ms inference latency.'
              ]).map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#6F9B83]">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#B89B62] font-semibold">
              Limitations & Constraints
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A5ADA7]">
              {(paper.limitations || [
                'Requires consistent hardware calibration across medical centers.',
                'High initial GPU memory consumption during slide graph construction.'
              ]).map((limitation, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#B89B62]">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right AI Assistant Panel */}
        <div className="space-y-4">
          <div className="sticky top-20 flex flex-col h-[580px] rounded-xl border border-white/[0.08] bg-[#101512] p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Sparkles className="h-4 w-4 text-[#6F9B83]" />
              <div>
                <h3 className="text-xs font-bold text-[#F5F7F3]">AI Assistant</h3>
                <span className="text-[10px] font-mono text-[#737B76]">Paper Reader Copilot</span>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-3">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(prompt.replace('✦ ', ''))}
                  disabled={loadingAi}
                  className="rounded-md border border-white/[0.08] bg-[#0C100E] px-2 py-1 text-[11px] text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:text-[#F5F7F3]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`rounded-lg p-2.5 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#315C4B] text-[#F5F7F3] max-w-[85%]'
                        : 'bg-[#0C100E] text-[#F5F7F3] border border-white/[0.06] max-w-[90%]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loadingAi && (
                <div className="flex items-center gap-2 p-2 text-xs text-[#6F9B83] font-mono">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing document...</span>
                </div>
              )}
            </div>

            {assistantError && <p role="alert" className="text-xs text-red-400 p-1">{assistantError}</p>}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(assistantInput);
              }}
              className="flex items-center gap-2 border-t border-white/[0.06] pt-3"
            >
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask about this paper..."
                disabled={loadingAi}
                className="flex-1 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1.5 text-xs text-[#F5F7F3] placeholder-[#737B76] outline-none focus:border-[#6F9B83]"
              />
              <button
                type="submit"
                disabled={loadingAi || !assistantInput.trim()}
                className="rounded-lg bg-[#315C4B] p-2 text-[#F5F7F3] hover:bg-[#3D705C] disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
