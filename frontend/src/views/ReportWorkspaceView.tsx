import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  Download, 
  Share2, 
  ArrowLeft, 
  Check, 
  Wand2, 
  AlignLeft, 
  Maximize2, 
  BookOpen, 
  List
} from 'lucide-react';
import type { ResearchReport, ReportSection } from '../types/research';
import confetti from 'canvas-confetti';

interface ReportWorkspaceViewProps {
  report: ResearchReport;
  onBack: () => void;
  onSaveReport: (report: ResearchReport) => void;
}

export const ReportWorkspaceView: React.FC<ReportWorkspaceViewProps> = ({
  report,
  onBack,
  onSaveReport
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(report.sections[0]?.id || '');
  const [sections, setSections] = useState<ReportSection[]>([...report.sections]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const updateSectionContent = (content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === currentSection.id ? { ...s, content } : s))
    );
  };

  const handleSave = () => {
    const updatedReport: ResearchReport = {
      ...report,
      sections,
      wordCount: sections.map((s) => s.content).join(' ').split(/\s+/).length
    };
    onSaveReport(updatedReport);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportPDF = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    alert(`Exporting "${report.title}" as PDF...`);
  };

  const runAiTool = async (action: string) => {
    if (!currentSection) return;
    setAiWorking(true);
    await new Promise((r) => setTimeout(r, 600));

    let updatedContent = currentSection.content;

    if (action === 'improve') {
      updatedContent = currentSection.content + '\n\n*AI Revision*: Enhanced clarity and academic tone across all citation references.';
    } else if (action === 'shorten') {
      updatedContent = currentSection.content.slice(0, Math.floor(currentSection.content.length * 0.7));
    } else if (action === 'expand') {
      updatedContent = currentSection.content + '\n\nAdditionally, future research must validate these empirical claims across heterogenous hardware configurations.';
    } else if (action === 'citation') {
      updatedContent = currentSection.content + ' [Jenkins et al., 2025; Rostova et al., 2025]';
    }

    updateSectionContent(updatedContent);
    setAiWorking(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D7D0] pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/[0.04] text-xs font-semibold text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-[#171717] tracking-tight truncate max-w-md">{report.title}</h2>
            <span className="text-[11px] text-[#6B6B67] font-mono">{report.type} • {report.wordCount} words</span>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              savedSuccess
                ? 'bg-emerald-600/15 text-emerald-600 border-emerald-600/40'
                : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#171717] border-[#D9D7D0]'
            }`}
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved!' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#DBEAFE] border border-[#1D4ED8]/40 text-xs font-semibold text-[#1D4ED8] shadow-glow-purple hover:bg-[#DBEAFE]/70 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="p-2 rounded-xl bg-black/5 hover:bg-black/[0.04] text-[#6B6B67] hover:text-[#171717] border border-[#D9D7D0] transition-colors"
            title="Share document link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Panel Document Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT PANEL: Table of Contents */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 space-y-3 sticky top-20">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#1D4ED8] uppercase tracking-wider font-semibold border-b border-[#D9D7D0] pb-2">
              <List className="w-4 h-4" />
              <span>Table of Contents</span>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => {
                const isActive = section.id === activeSectionId;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]/30 font-bold'
                        : 'text-[#6B6B67] hover:text-[#171717] hover:bg-black/5'
                    }`}
                  >
                    <span className="truncate block">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* CENTER PANEL: Interactive Report Content Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 min-h-[600px] border border-[#D9D7D0] shadow-card">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-[#D9D7D0] pb-3">
              <h2 className="text-xl font-bold text-[#171717] tracking-tight">
                {currentSection?.title}
              </h2>
              <span className="text-[10px] font-mono text-[#1D4ED8] px-2 py-0.5 rounded bg-[#DBEAFE] border border-[#1D4ED8]/30">
                EDIT MODE
              </span>
            </div>

            {/* Editable Content Textarea */}
            <textarea
              value={currentSection?.content || ''}
              onChange={(e) => updateSectionContent(e.target.value)}
              rows={16}
              className="w-full bg-transparent text-[#171717] placeholder-[#8B8F98] text-sm md:text-base leading-relaxed font-sans focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* RIGHT PANEL: AI Document Copilot Tools */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-[#1D4ED8]/40 shadow-glow-purple space-y-4 sticky top-20">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#D9D7D0]">
              <Sparkles className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="text-sm font-bold text-[#171717]">AI Document Copilot</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => runAiTool('improve')}
                disabled={aiWorking}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                <Wand2 className="w-4 h-4 text-[#1D4ED8]" />
                <span>Improve Writing & Flow</span>
              </button>

              <button
                onClick={() => runAiTool('shorten')}
                disabled={aiWorking}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                <AlignLeft className="w-4 h-4 text-amber-600" />
                <span>Shorten Section</span>
              </button>

              <button
                onClick={() => runAiTool('expand')}
                disabled={aiWorking}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                <Maximize2 className="w-4 h-4 text-[#1D4ED8]" />
                <span>Expand Technical Detail</span>
              </button>

              <button
                onClick={() => runAiTool('citation')}
                disabled={aiWorking}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Add Formatted Citations</span>
              </button>
            </div>

            {/* Custom Prompt Box */}
            <div className="pt-3 border-t border-[#D9D7D0] space-y-2">
              <label className="text-[11px] text-[#6B6B67] font-mono block">Ask AI Copilot:</label>
              <textarea
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="e.g. 'Rewrite this paragraph in formal IEEE academic tone'"
                rows={3}
                className="w-full bg-white border border-[#D9D7D0] rounded-xl p-2.5 text-xs text-[#171717] placeholder-[#8B8F98] focus:outline-none focus:border-[#1D4ED8] resize-none"
              />
              <button
                onClick={() => runAiTool('custom')}
                disabled={aiWorking || !aiPromptInput.trim()}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
              >
                Apply AI Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
