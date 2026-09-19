import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Layers, 
  Settings2, 
  BookMarked,
  ArrowRight
} from 'lucide-react';
import { LoadingState } from '../components/LoadingState';
import type { Paper, ResearchReport } from '../types/research';
import { aiService } from '../services/aiService';

interface ReportGeneratorViewProps {
  initialSourcePapers: Paper[];
  allPapers: Paper[];
  onReportGenerated: (report: ResearchReport) => void;
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  initialSourcePapers,
  allPapers,
  onReportGenerated
}) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [reportType, setReportType] = useState<'Literature Review' | 'Research Summary' | 'Comparative Analysis' | 'Academic Report' | 'Custom'>('Literature Review');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(
    initialSourcePapers.length > 0 ? initialSourcePapers.map((p) => p.id) : [allPapers[0]?.id].filter(Boolean)
  );

  const availableSections = [
    'Introduction',
    'Paper Overview',
    'Methodology',
    'Findings',
    'Discussion',
    'Limitations',
    'Conclusion',
    'References'
  ];

  const [selectedSections, setSelectedSections] = useState<string[]>([...availableSections]);
  const [generating, setGenerating] = useState(false);

  const togglePaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleGenerate = async () => {
    const reportTopic = topic.trim() || title.trim();
    if (!reportTopic && selectedPaperIds.length === 0) return;
    setGenerating(true);

    const sourcePapers = allPapers.filter((p) => selectedPaperIds.includes(p.id));
    const reportTitle = title.trim() || `${reportType}: ${sourcePapers[0]?.title.slice(0, 35)}...`;

    try {
      const report = reportTopic
        ? await aiService.generateResearchReport(reportTopic)
        : await aiService.generateReport(reportTitle, reportType, sourcePapers, selectedSections);
      onReportGenerated(report);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#1D4ED8] uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Report Generator</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">Generate Research Report</h2>
        <p className="text-xs text-[#6B6B67] mt-1">
          Combine paper metadata, structured AI summaries, and cross-domain synthesis into publication-grade documents.
        </p>
      </div>

      {generating ? (
        <LoadingState
          message="AI Agents Writing & Structuring Academic Report..."
          subMessage="Formatting citations, generating markdown document sections, and executing cross-reference validation..."
        />
      ) : (
        <div className="space-y-6">
          {/* Step 1: Select Source Papers */}
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#171717]">Research topic</h3>
            <p className="text-xs text-[#6B6B67]">The backend crew searches verified papers and writes the complete report.</p>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Federated learning for medical imaging"
              className="w-full rounded-xl border border-[#D9D7D0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D4ED8]"
            />
          </div>

          {/* Step 1: Select Source Papers */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9D7D0] pb-3">
              <h3 className="text-sm font-bold text-[#171717] flex items-center space-x-2">
                <BookMarked className="w-4 h-4 text-[#1D4ED8]" />
                <span>1. Select Source Papers ({selectedPaperIds.length} Selected)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {allPapers.map((paper) => {
                const isSelected = selectedPaperIds.includes(paper.id);
                return (
                  <button
                    key={paper.id}
                    onClick={() => togglePaper(paper.id)}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                      isSelected
                        ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/50 shadow-glow-purple'
                        : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'border-[#C4C2BB]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-[#171717]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-[#171717] block truncate">{paper.title}</span>
                      <span className="text-[11px] text-[#6B6B67] font-mono">{paper.authors[0]} et al. ({paper.year})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Configure Report Type & Title */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#171717] flex items-center space-x-2 border-b border-[#D9D7D0] pb-3">
              <Layers className="w-4 h-4 text-[#1D4ED8]" />
              <span>2. Choose Report Format & Title</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#6B6B67] block mb-1.5 font-medium">Document Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Systematic Literature Review on Multi-Agent LLM Reasoning"
                  className="w-full bg-white border border-[#D9D7D0] rounded-xl px-4 py-2.5 text-sm text-[#171717] placeholder-[#8B8F98] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-xs text-[#6B6B67] block mb-2 font-medium">Report Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(['Literature Review', 'Research Summary', 'Comparative Analysis', 'Academic Report', 'Custom'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setReportType(type)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        reportType === type
                          ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/50 shadow-glow-purple'
                          : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Select Document Sections */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#171717] flex items-center space-x-2 border-b border-[#D9D7D0] pb-3">
              <Settings2 className="w-4 h-4 text-emerald-600" />
              <span>3. Include Document Sections</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableSections.map((sec) => {
                const isChecked = selectedSections.includes(sec);
                return (
                  <button
                    key={sec}
                    onClick={() => toggleSection(sec)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                      isChecked
                        ? 'bg-black/[0.04] text-[#171717] border-[#1D4ED8]/40'
                        : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0] hover:text-[#171717]'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      isChecked ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'border-[#C4C2BB]'
                    }`}>
                      {isChecked && <Check className="w-2.5 h-2.5 text-[#171717]" />}
                    </div>
                    <span>{sec}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleGenerate}
            disabled={selectedPaperIds.length === 0 || selectedSections.length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-white text-base font-bold shadow-glow-purple-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Research Report</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};
