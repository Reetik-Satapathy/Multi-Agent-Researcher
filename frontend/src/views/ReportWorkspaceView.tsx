import React, { useEffect, useState } from 'react';
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
  List,
  FileText,
  LoaderCircle,
} from 'lucide-react';
import { MarkdownContent } from '../components/MarkdownContent';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { aiService, type ReportEditAction } from '../services/aiService';
import type { ResearchReport, ReportSection } from '../types/research';

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
  const [activeSectionId, setActiveSectionId] = useLocalStorageState<string>(
    `report-active-section-v1-${report.id}`,
    report.sections[0]?.id || '',
  );
  const [sections, setSections] = useLocalStorageState<ReportSection[]>(`report-draft-v1-${report.id}`, [...report.sections]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportError, setExportError] = useState('');
  const [aiWorkingAction, setAiWorkingAction] = useState<ReportEditAction | null>(null);
  const [aiError, setAiError] = useState('');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'sections' | 'full'>('sections');

  useEffect(() => {
    setActiveSectionId(report.sections[0]?.id || '');
    setEditing(false);
  }, [report.id, report.sections]);

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const currentWordCount = sections.map((section) => section.content).join(' ').split(/\s+/).filter(Boolean).length;
  const aiWorking = aiWorkingAction !== null;

  const updateSectionContent = (content: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === currentSection.id ? { ...s, content } : s))
    );
  };

  const handleSave = () => {
    const updatedReport: ResearchReport = {
      ...report,
      sections,
      wordCount: currentWordCount
    };
    onSaveReport(updatedReport);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportPDF = () => {
    const reportElement = document.getElementById('report-print-content');
    if (!reportElement) {
      setExportError('The report could not be prepared for PDF export.');
      return;
    }

    setExportError('');
    const frame = document.createElement('iframe');
    frame.title = 'Research report PDF export';
    frame.style.cssText = 'position:fixed;left:-12000px;top:0;width:1000px;height:1200px;border:0;';
    document.body.append(frame);
    const printDocument = frame.contentDocument;
    const printWindow = frame.contentWindow;
    if (!printDocument || !printWindow) {
      frame.remove();
      setExportError('Your browser could not create the PDF print view.');
      return;
    }

    let cleanupTimer = 0;
    const cleanup = () => {
      window.clearTimeout(cleanupTimer);
      frame.remove();
    };
    printWindow.addEventListener('afterprint', cleanup, { once: true });
    cleanupTimer = window.setTimeout(cleanup, 60_000);

    const printableReport = reportElement.cloneNode(true) as HTMLElement;
    printableReport.classList.remove('report-full-document-screen-hidden');
    printableReport.querySelectorAll('button').forEach((control) => control.remove());
    printableReport.querySelectorAll('textarea').forEach((editor) => editor.remove());
    printableReport.querySelectorAll('.report-full-edit-preview').forEach((preview) => {
      preview.classList.remove('report-full-edit-preview');
    });

    const printStyles = `
      @page { size: A4; margin: 14mm; }
      *, *::before, *::after { box-sizing: border-box; }
      html, body { width: auto; min-height: 0; margin: 0; padding: 0; overflow: visible !important; background: #F5F3EE !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
      body { color: #171717; font-family: Arial, sans-serif; }
      #report-print-content { position: static !important; display: block !important; width: 100% !important; max-width: none !important; margin: 0 auto !important; padding: 10mm !important; overflow: visible !important; border: 1px solid #D9D7D0; border-radius: 12px; background: #fff !important; box-shadow: 0 4px 18px rgba(23, 37, 84, .08); color: #171717; font-size: 10.5pt; line-height: 1.75; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
      #report-print-content header { margin-bottom: 7mm; padding-bottom: 4mm; border-color: #D9D7D0; }
      #report-print-content h1 { margin: 0; color: #171717; font-size: 22pt; line-height: 1.2; break-after: avoid; }
      #report-print-content header p { margin-top: 2mm; color: #6B6B67; font-size: 9pt; }
      #report-print-content section { display: block; padding-top: 7mm; padding-bottom: 7mm; border-color: #D9D7D0; overflow: visible !important; break-inside: auto; }
      #report-print-content section > div:first-child { margin-bottom: 4mm; padding-bottom: 2mm; border-color: #D9D7D0; }
      #report-print-content h2, #report-print-content h3, #report-print-content h4 { margin-top: 0; margin-bottom: 0; color: #171717; font-size: 17pt; line-height: 1.3; break-after: avoid; }
      #report-print-content p, #report-print-content li { color: #171717; font-size: 10.5pt; line-height: 1.75; orphans: 3; widows: 3; }
      #report-print-content p { margin-top: 3mm; margin-bottom: 3mm; }
      #report-print-content ul, #report-print-content ol { margin-top: 3mm; margin-bottom: 3mm; padding-left: 7mm; }
      #report-print-content table { width: 100%; border-collapse: collapse; font-size: 9pt; break-inside: auto; }
      #report-print-content thead { display: table-header-group; }
      #report-print-content tr { break-inside: avoid; }
      #report-print-content th { background: #F5F3EE !important; font-weight: 700; }
      #report-print-content th, #report-print-content td { border: 1px solid #D9D7D0; padding: 2mm; vertical-align: top; }
      #report-print-content .overflow-x-auto { overflow: visible !important; }
      #report-print-content a { color: #1D4ED8 !important; text-decoration: underline; }
      #report-print-content code { overflow-wrap: anywhere; }
    `;

    printDocument.open();
    printDocument.write(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title></title><style>${printStyles}</style></head><body>${printableReport.outerHTML}</body></html>`,
    );
    printDocument.close();
    printDocument.title = `${report.title} - Research Report`;

    try {
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      cleanup();
      setExportError(error instanceof Error ? error.message : 'The report PDF could not be opened for printing.');
    }
  };

  const runAiTool = async (action: ReportEditAction) => {
    if (!currentSection || aiWorking) return;
    if (action === 'custom' && !aiPromptInput.trim()) return;

    setAiWorkingAction(action);
    setAiError('');
    try {
      const referenceContext = sections
        .filter((section) => /reference|citation|bibliography/i.test(section.title))
        .map((section) => `${section.title}\n${section.content}`)
        .join('\n\n')
        .slice(0, 12000);
      const updatedContent = await aiService.editReportSection({
        reportTitle: report.title,
        sectionTitle: currentSection.title,
        content: currentSection.content,
        action,
        customPrompt: action === 'custom' ? aiPromptInput.trim() : undefined,
        referenceContext,
      });
      updateSectionContent(updatedContent);
      if (action === 'custom') setAiPromptInput('');
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'The report section could not be edited.');
    } finally {
      setAiWorkingAction(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <article
        id="report-print-content"
        className={`glass-panel report-full-document mx-auto w-full max-w-5xl rounded-2xl border border-[#D9D7D0] p-6 shadow-card md:p-10 ${viewMode === 'full' ? '' : 'report-full-document-screen-hidden'}`}
      >
        <header className="mb-8 border-b border-[#D9D7D0] pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] md:text-3xl">{report.title}</h1>
          <p className="mt-2 text-sm text-[#6B6B67]">{report.type} · {currentWordCount} words</p>
        </header>
        <div className="divide-y divide-[#D9D7D0]">
        {sections.map((section) => (
          <section key={section.id} className="py-7 first:pt-0 last:pb-0">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#D9D7D0] pb-3">
              <h2 className="text-xl font-bold tracking-tight text-[#171717] md:text-2xl">{section.title}</h2>
              <button
                type="button"
                onClick={() => {
                  setActiveSectionId(section.id);
                  setEditing((editingSection) => activeSectionId === section.id && editingSection ? false : true);
                }}
                className="report-full-edit-actions shrink-0 rounded bg-[#DBEAFE] px-2 py-1 text-[10px] font-mono text-[#1D4ED8] border border-[#1D4ED8]/30"
              >
                {editing && activeSectionId === section.id ? 'PREVIEW' : 'EDIT'}
              </button>
            </div>
            {editing && activeSectionId === section.id ? (
              <>
                <textarea
                  value={section.content}
                  onChange={(event) => setSections((previous) => previous.map((item) =>
                    item.id === section.id ? { ...item, content: event.target.value } : item,
                  ))}
                  rows={24}
                  aria-label={`Edit ${section.title}`}
                  className="report-full-edit-field w-full resize-y bg-transparent text-sm leading-relaxed text-[#171717] focus:outline-none md:text-base"
                />
                <div className="report-full-edit-preview">
                  <MarkdownContent content={section.content} />
                </div>
              </>
            ) : (
              <MarkdownContent content={section.content} />
            )}
          </section>
        ))}
        </div>
      </article>
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
            <span className="text-[11px] text-[#6B6B67] font-mono">{report.type} • {currentWordCount} words</span>
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
      {exportError && <p role="alert" className="text-right text-sm text-red-600">{exportError}</p>}

      <div className="flex justify-end">
        <div className="inline-flex rounded-xl border border-[#D9D7D0] bg-white p-1" role="group" aria-label="Report view">
          <button
            type="button"
            onClick={() => setViewMode('sections')}
            aria-pressed={viewMode === 'sections'}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              viewMode === 'sections'
                ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                : 'text-[#6B6B67] hover:bg-black/5 hover:text-[#171717]'
            }`}
          >
            <List className="h-4 w-4" />
            Section view
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('full');
              setEditing(false);
            }}
            aria-pressed={viewMode === 'full'}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              viewMode === 'full'
                ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                : 'text-[#6B6B67] hover:bg-black/5 hover:text-[#171717]'
            }`}
          >
            <FileText className="h-4 w-4" />
            Full report
          </button>
        </div>
      </div>

      {viewMode === 'full' ? (
        null
      ) : (
      /* 3-Panel Document Workspace Layout */
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
              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                className="rounded bg-[#DBEAFE] px-2 py-1 text-[10px] font-mono text-[#1D4ED8] border border-[#1D4ED8]/30"
              >
                {editing ? 'PREVIEW' : 'EDIT'}
              </button>
            </div>

            {editing ? (
              <textarea
                value={currentSection?.content || ''}
                onChange={(e) => updateSectionContent(e.target.value)}
                rows={24}
                className="w-full bg-transparent text-[#171717] placeholder-[#8B8F98] text-sm md:text-base leading-relaxed font-sans focus:outline-none resize-y"
              />
            ) : currentSection ? (
              <MarkdownContent content={currentSection.content} />
            ) : (
              <p className="text-sm text-[#6B6B67]">No report sections are available.</p>
            )}
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
                onClick={() => void runAiTool('improve')}
                disabled={aiWorking || !currentSection}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                {aiWorkingAction === 'improve'
                  ? <LoaderCircle className="w-4 h-4 animate-spin text-[#1D4ED8]" />
                  : <Wand2 className="w-4 h-4 text-[#1D4ED8]" />}
                <span>{aiWorkingAction === 'improve' ? 'Improving writing...' : 'Improve Writing & Flow'}</span>
              </button>

              <button
                onClick={() => void runAiTool('shorten')}
                disabled={aiWorking || !currentSection}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                {aiWorkingAction === 'shorten'
                  ? <LoaderCircle className="w-4 h-4 animate-spin text-amber-600" />
                  : <AlignLeft className="w-4 h-4 text-amber-600" />}
                <span>{aiWorkingAction === 'shorten' ? 'Shortening section...' : 'Shorten Section'}</span>
              </button>

              <button
                onClick={() => void runAiTool('expand')}
                disabled={aiWorking || !currentSection}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                {aiWorkingAction === 'expand'
                  ? <LoaderCircle className="w-4 h-4 animate-spin text-[#1D4ED8]" />
                  : <Maximize2 className="w-4 h-4 text-[#1D4ED8]" />}
                <span>{aiWorkingAction === 'expand' ? 'Expanding detail...' : 'Expand Technical Detail'}</span>
              </button>

              <button
                onClick={() => void runAiTool('citation')}
                disabled={aiWorking || !currentSection}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#DBEAFE] border border-[#D9D7D0] hover:border-[#1D4ED8]/40 text-xs font-semibold text-[#171717] transition-all text-left"
              >
                {aiWorkingAction === 'citation'
                  ? <LoaderCircle className="w-4 h-4 animate-spin text-emerald-600" />
                  : <BookOpen className="w-4 h-4 text-emerald-600" />}
                <span>{aiWorkingAction === 'citation' ? 'Formatting citations...' : 'Add Formatted Citations'}</span>
              </button>
            </div>

            {/* Custom Prompt Box */}
            <div className="pt-3 border-t border-[#D9D7D0] space-y-2">
              <label htmlFor="report-copilot-prompt" className="text-[11px] text-[#6B6B67] font-mono block">Ask AI Copilot:</label>
              <textarea
                id="report-copilot-prompt"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="e.g. 'Rewrite this paragraph in formal IEEE academic tone'"
                maxLength={2000}
                rows={3}
                className="w-full bg-white border border-[#D9D7D0] rounded-xl p-2.5 text-xs text-[#171717] placeholder-[#8B8F98] focus:outline-none focus:border-[#1D4ED8] resize-none"
              />
              {aiError && <p role="alert" className="text-xs text-red-600">{aiError}</p>}
              {aiWorking && <p role="status" className="text-xs text-[#6B6B67]">Editing “{currentSection?.title}”...</p>}
              <button
                onClick={() => void runAiTool('custom')}
                disabled={aiWorking || !currentSection || !aiPromptInput.trim()}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-xs font-semibold shadow-glow-purple hover:opacity-95 transition-all"
              >
                {aiWorking ? 'Applying Edit...' : 'Apply AI Edit'}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
