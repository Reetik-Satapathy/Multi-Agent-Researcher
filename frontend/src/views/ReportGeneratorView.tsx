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
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <div className="mb-1 flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#1D4ED8]">
          <Sparkles className="h-4 w-4" />
          <span>AI Report Generator</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Generate Research Report</h2>
        <p className="mt-1 text-xs text-[#6B6B67]">
          Enter a research topic. The full research crew will find papers, analyze the field, and write a report.
        </p>
      </div>

      {generating ? (
        <LoadingState
          message="AI Agents Writing & Structuring Academic Report..."
          subMessage="The full crew is searching papers, analyzing research, and generating your report."
        />
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="glass-panel space-y-3 rounded-2xl p-6">
            <label htmlFor="report-topic" className="block text-sm font-bold">
              Research topic
            </label>
            <input
              id="report-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Federated learning for medical imaging"
              required
              minLength={2}
              maxLength={500}
              className="w-full rounded-xl border border-[#D9D7D0] bg-white px-4 py-3 text-sm outline-none focus:border-[#1D4ED8]"
            />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={!topic.trim()}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-[#1D4ED8] py-4 text-base font-bold text-white shadow-glow-purple-lg transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generate Research Report</span>
            <ArrowRight className="ml-1 h-5 w-5" />
          </button>
        </form>
      )}

      {reports.length > 0 && (
        <section className="space-y-3" aria-labelledby="saved-reports-heading">
          <div>
            <h3 id="saved-reports-heading" className="text-lg font-bold">Your saved reports</h3>
            <p className="mt-1 text-xs text-[#6B6B67]">Open a generated report to continue reading or editing it.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => onOpenReport(report)}
                className="glass-panel glass-panel-hover flex items-start gap-3 rounded-2xl p-4 text-left"
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
                <span className="min-w-0">
                  <span className="block font-semibold text-[#171717]">{report.title}</span>
                  <span className="mt-1 block text-xs text-[#6B6B67]">
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
