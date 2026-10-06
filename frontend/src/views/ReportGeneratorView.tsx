import { useState, type FormEvent } from 'react';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { LoadingState } from '../components/LoadingState';
import type { ResearchReport } from '../types/research';
import { aiService } from '../services/aiService';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

interface ReportGeneratorViewProps {
  reports: ResearchReport[];
  onReportGenerated: (report: ResearchReport) => void;
  onOpenReport: (report: ResearchReport) => void;
}

export function ReportGeneratorView({ reports, onReportGenerated, onOpenReport }: ReportGeneratorViewProps) {
  const [topic, setTopic] = useLocalStorageState('report-generator-topic-v1', '');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const researchTopic = topic.trim();
    if (!researchTopic || generating) return;

    setGenerating(true);
    setError('');
    try {
      const report = await aiService.generateResearchReport(researchTopic);
      onReportGenerated(report);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Research report generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <div className="mb-1.5 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6F9B83]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Report Engine</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#F5F7F3]">Generate Research Report</h2>
        <p className="mt-1 text-xs text-[#A5ADA7]">
          Enter a research topic to synthesize literature, extract methodology, and generate a structured paper.
        </p>
      </div>

      {generating ? (
        <LoadingState
          message="AI Agents Synthesizing Research & Writing Report..."
          subMessage="Searching papers, analyzing literature, and structuring sections..."
        />
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#101512] p-6">
            <label htmlFor="report-topic" className="block text-xs font-semibold uppercase tracking-wider text-[#6F9B83]">
              Research Topic or Question
            </label>
            <input
              id="report-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Federated learning for privacy-preserving medical imaging"
              required
              minLength={2}
              maxLength={500}
              className="w-full rounded-lg border border-white/[0.08] bg-[#0C100E] px-4 py-3 text-sm text-[#F5F7F3] placeholder-[#737B76] outline-none focus:border-[#6F9B83]"
            />
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={!topic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#315C4B] py-3.5 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Research Report</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {reports.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-white/[0.08]" aria-labelledby="saved-reports-heading">
          <div>
            <h3 id="saved-reports-heading" className="text-sm font-semibold text-[#F5F7F3]">Saved Reports</h3>
            <p className="mt-0.5 text-xs text-[#A5ADA7]">Open a generated report to continue reading or editing.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => onOpenReport(report)}
                className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#101512] p-4 text-left transition-colors hover:border-[#6F9B83]/30 hover:bg-[#141B17]"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#6F9B83]" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-[#F5F7F3] truncate">{report.title}</span>
                  <span className="mt-1 block font-mono text-[11px] text-[#737B76]">
                    {report.date} · {report.wordCount} words · {report.sections.length} sections
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
