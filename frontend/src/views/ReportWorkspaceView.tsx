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
  LoaderCircle,
  PenTool,
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

function withoutRepeatedSectionHeading(content: string, title: string): string {
  const lines = content.split(/\r?\n/);
  const firstContentLine = lines.findIndex((line) => line.trim());
  if (firstContentLine === -1) return content;

  const normalize = (value: string) => value
    .replace(/^#{1,6}\s*/, '')
    .replace(/^(?:\*\*|__)(.*)(?:\*\*|__)$/, '$1')
    .replace(/^\d+[.)]\s*/, '')
    .trim()
    .toLowerCase();

  if (normalize(lines[firstContentLine]) !== normalize(title)) return content;
  return lines.slice(firstContentLine + 1).join('\n').replace(/^\s+/, '');
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
      @page { size: A4; margin: 14mm; background: #fff; }
      *, *::before, *::after { box-sizing: border-box; }
      html, body { width: auto; min-height: 0; margin: 0; padding: 0; overflow: visible !important; background: #fff !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
      body { color: #000; font-family: Inter, Arial, sans-serif; }
      #report-print-content { position: static !important; display: block !important; width: 100% !important; max-width: none !important; margin: 0 auto !important; padding: 10mm !important; overflow: visible !important; border: 1px solid rgba(0,0,0,0.12); border-radius: 12px; background: #fff !important; color: #000; font-size: 10.5pt; line-height: 1.75; }
      #report-print-content, #report-print-content * { background-color: #fff !important; color: #000 !important; }
      #report-print-content header { margin-bottom: 7mm; padding-bottom: 4mm; border-bottom: 1px solid rgba(0,0,0,0.12); }
      #report-print-content h1 { margin: 0; font-size: 22pt; line-height: 1.2; }
      #report-print-content header p { margin-top: 2mm; font-size: 9pt; }
      #report-print-content section { display: block; padding-top: 7mm; padding-bottom: 7mm; border-bottom: 1px solid rgba(0,0,0,0.12); }
      #report-print-content h2, #report-print-content h3 { margin-top: 0; margin-bottom: 0; font-size: 16pt; }
      #report-print-content p, #report-print-content li { font-size: 10.5pt; line-height: 1.75; }
      #report-print-content a { text-decoration: underline; }
    `;

    printDocument.open();
    printDocument.write(
      `<!doctype html><html><head><meta charset="utf-8"><title></title><style>${printStyles}</style></head><body>${printableReport.outerHTML}</body></html>`,
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
    <div className="space-y-6 pb-16">
      {/* Top Header & Actions Bar */}
      <div className="sticky top-12 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-[#070807]/95 py-2 pb-4 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0C100E] px-2.5 py-1.5 text-xs text-[#A5ADA7] transition-colors hover:border-white/[0.16] hover:text-[#F5F7F3]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Reports</span>
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[#F5F7F3] max-w-md">{report.title}</h2>
            <span className="font-mono text-[11px] text-[#737B76]">{report.type} · {currentWordCount} words</span>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              savedSuccess
                ? 'border-[#6F9B83]/50 bg-[#16231D] text-[#F5F7F3]'
                : 'border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-white/[0.16] hover:text-[#F5F7F3]'
            }`}
          >
            {savedSuccess ? <Check className="h-3.5 w-3.5 text-[#6F9B83]" /> : <Save className="h-3.5 w-3.5 text-[#737B76]" />}
            <span>{savedSuccess ? 'Saved!' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg bg-[#315C4B] px-3 py-1.5 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="rounded-lg border border-white/[0.08] bg-[#0C100E] p-1.5 text-[#737B76] hover:text-[#F5F7F3] transition-colors"
            title="Share report link"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <div className="ml-2 flex rounded-lg border border-white/[0.08] bg-[#0C100E] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('sections')}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                viewMode === 'sections' ? 'bg-[#16231D] font-medium text-[#F5F7F3]' : 'text-[#737B76] hover:text-[#F5F7F3]'
              }`}
            >
              Sections
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('full');
                setEditing(false);
              }}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                viewMode === 'full' ? 'bg-[#16231D] font-medium text-[#F5F7F3]' : 'text-[#737B76] hover:text-[#F5F7F3]'
              }`}
            >
              Full View
            </button>
          </div>
        </div>
      </div>
      {exportError && <p role="alert" className="text-right text-xs text-red-400">{exportError}</p>}

      {/* Hidden PDF Printable Target */}
      <article
        id="report-print-content"
        className={`report-full-document mx-auto w-full max-w-4xl rounded-xl border border-white/[0.08] bg-[#101512] p-8 md:p-12 ${viewMode === 'full' ? '' : 'report-full-document-screen-hidden'}`}
      >
        <header className="mb-8 border-b border-white/[0.08] pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F7F3] md:text-3xl">{report.title}</h1>
          <p className="mt-2 text-xs text-[#A5ADA7] font-mono">{report.type} · {currentWordCount} words</p>
        </header>
        <div className="divide-y divide-white/[0.08]">
          {sections.map((section) => (
            <section key={section.id} className="py-6 first:pt-0 last:pb-0">
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-2">
                <h2 className="text-lg font-bold tracking-tight text-[#F5F7F3]">{section.title}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSectionId(section.id);
                    setEditing((editingSection) => activeSectionId === section.id && editingSection ? false : true);
                  }}
                  className="report-full-edit-actions shrink-0 rounded border border-white/[0.08] bg-[#0C100E] px-2 py-0.5 font-mono text-[10px] text-[#6F9B83]"
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
                    rows={20}
                    aria-label={`Edit ${section.title}`}
                    className="report-full-edit-field w-full resize-y rounded-lg border border-white/[0.08] bg-[#0C100E] p-3 text-xs leading-relaxed text-[#F5F7F3] outline-none focus:border-[#6F9B83]"
                  />
                  <div className="report-full-edit-preview">
                    <MarkdownContent content={withoutRepeatedSectionHeading(section.content, section.title)} />
                  </div>
                </>
              ) : (
                <MarkdownContent content={withoutRepeatedSectionHeading(section.content, section.title)} />
              )}
            </section>
          ))}
        </div>
      </article>

      {viewMode === 'full' ? null : (
        /* 3-Column Notion-Style Academic Editor Layout */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: Table of Contents / Document Tree (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="sticky top-20 space-y-2 rounded-xl border border-white/[0.08] bg-[#101512] p-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#6F9B83]">
                <List className="h-3.5 w-3.5" />
                <span>Document Outline</span>
              </div>

              <nav className="space-y-0.5 pt-1">
                {sections.map((section) => {
                  const isActive = section.id === activeSectionId;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSectionId(section.id)}
                      className={`block w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? 'border border-[#6F9B83]/30 bg-[#16231D] font-medium text-[#F5F7F3]'
                          : 'text-[#A5ADA7] hover:bg-[#141B17] hover:text-[#F5F7F3]'
                      }`}
                    >
                      <span className="truncate block">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* CENTER COLUMN: Large Academic Document Editor (6 Cols - DOMINATES SCREEN) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="min-h-[640px] rounded-xl border border-white/[0.08] bg-[#101512] p-6 md:p-8 space-y-5">
              {/* Section Title Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-lg font-bold text-[#F5F7F3] tracking-tight">
                  {currentSection?.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditing((current) => !current)}
                  className="rounded-md border border-white/[0.08] bg-[#0C100E] px-2.5 py-1 text-[11px] font-mono text-[#6F9B83] hover:border-[#6F9B83]/40"
                >
                  {editing ? 'PREVIEW' : 'EDIT MARKDOWN'}
                </button>
              </div>

              {editing ? (
                <textarea
                  value={currentSection?.content || ''}
                  onChange={(e) => updateSectionContent(e.target.value)}
                  rows={24}
                  className="w-full resize-y rounded-lg border border-white/[0.08] bg-[#0C100E] p-4 text-xs md:text-sm leading-relaxed font-sans text-[#F5F7F3] outline-none focus:border-[#6F9B83]"
                />
              ) : currentSection ? (
                <div className="text-xs md:text-sm leading-relaxed text-[#F5F7F3]">
                  <MarkdownContent content={withoutRepeatedSectionHeading(currentSection.content, currentSection.title)} />
                </div>
              ) : (
                <p className="text-xs text-[#737B76]">No section selected.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI Assistant Tools Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="sticky top-20 space-y-4 rounded-xl border border-white/[0.08] bg-[#101512] p-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Sparkles className="h-4 w-4 text-[#6F9B83]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7F3]">AI Writing Assistant</h4>
              </div>

              {/* AI Quick Actions */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => void runAiTool('improve')}
                  disabled={aiWorking || !currentSection}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-left text-xs text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17] hover:text-[#F5F7F3] disabled:opacity-40"
                >
                  {aiWorkingAction === 'improve' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#6F9B83]" /> : <Wand2 className="h-3.5 w-3.5 text-[#6F9B83]" />}
                  <span>Improve Writing & Flow</span>
                </button>

                <button
                  type="button"
                  onClick={() => void runAiTool('shorten')}
                  disabled={aiWorking || !currentSection}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-left text-xs text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17] hover:text-[#F5F7F3] disabled:opacity-40"
                >
                  {aiWorkingAction === 'shorten' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#B89B62]" /> : <AlignLeft className="h-3.5 w-3.5 text-[#B89B62]" />}
                  <span>Summarize / Shorten</span>
                </button>

                <button
                  type="button"
                  onClick={() => void runAiTool('expand')}
                  disabled={aiWorking || !currentSection}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-left text-xs text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17] hover:text-[#F5F7F3] disabled:opacity-40"
                >
                  {aiWorkingAction === 'expand' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#6F9B83]" /> : <Maximize2 className="h-3.5 w-3.5 text-[#6F9B83]" />}
                  <span>Expand Section Detail</span>
                </button>

                <button
                  type="button"
                  onClick={() => void runAiTool('citation')}
                  disabled={aiWorking || !currentSection}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-left text-xs text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17] hover:text-[#F5F7F3] disabled:opacity-40"
                >
                  {aiWorkingAction === 'citation' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#6F9B83]" /> : <BookOpen className="h-3.5 w-3.5 text-[#6F9B83]" />}
                  <span>Add References & Citations</span>
                </button>

                <button
                  type="button"
                  onClick={() => void runAiTool('improve')}
                  disabled={aiWorking || !currentSection}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-left text-xs text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17] hover:text-[#F5F7F3] disabled:opacity-40"
                >
                  <PenTool className="h-3.5 w-3.5 text-[#6F9B83]" />
                  <span>Generate Draft Section</span>
                </button>
              </div>

              {/* Custom Prompt Box */}
              <div className="border-t border-white/[0.06] pt-3 space-y-2">
                <label htmlFor="custom-ai-instruction" className="text-[11px] font-mono text-[#737B76] block">Custom Instruction:</label>
                <textarea
                  id="custom-ai-instruction"
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="e.g. 'Format equations in formal IEEE notation'"
                  maxLength={2000}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/[0.08] bg-[#0C100E] p-2.5 text-xs text-[#F5F7F3] placeholder-[#737B76] outline-none focus:border-[#6F9B83]"
                />
                {aiError && <p role="alert" className="text-xs text-red-400">{aiError}</p>}
                {aiWorking && <p role="status" className="text-xs text-[#6F9B83]">Applying AI edits to section...</p>}
                <button
                  type="button"
                  onClick={() => void runAiTool('custom')}
                  disabled={aiWorking || !currentSection || !aiPromptInput.trim()}
                  className="w-full rounded-lg bg-[#315C4B] py-2 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {aiWorking ? 'Processing...' : 'Apply Instruction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
