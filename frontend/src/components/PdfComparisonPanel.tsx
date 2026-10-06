import { useState } from 'react';
import { CheckCircle2, LoaderCircle, Trash2, Upload } from 'lucide-react';
import type { DocumentMetadata } from '../types/research';
import { documentService, type DocumentChatMessage, type DocumentComparisonResult, type DocumentUploadProgress } from '../services/documentService';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { DocumentChatInterface } from './DocumentChatInterface';

export function PdfComparisonPanel() {
  const [documents, setDocuments] = useLocalStorageState<Array<DocumentMetadata | null>>('pdf-comparison-documents-v1', [null, null]);
  const [comparison, setComparison] = useLocalStorageState<DocumentComparisonResult | null>('pdf-comparison-result-v1', null);
  const [messages, setMessages] = useLocalStorageState<DocumentChatMessage[]>('pdf-comparison-messages-v1', []);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress | null>(null);

  const clearWorkspace = () => {
    setDocuments([null, null]);
    setComparison(null);
    setMessages([]);
    setQuestion('');
    setError('');
  };

  const upload = async (file: File, slot: number) => {
    setBusy(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
    setError('');
    try {
      const result = await documentService.upload(file, setUploadProgress);
      setDocuments((current) => {
        const next = [...current];
        next[slot] = result.metadata;
        return next;
      });
      setComparison(null);
      setMessages([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'PDF upload failed.');
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const compare = async () => {
    if (!documents[0] || !documents[1]) return;
    setBusy(true);
    setError('');
    try {
      setComparison(await documentService.compare(documents.map((document) => document!.document_id)));
      setMessages([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'PDF comparison failed.');
    } finally {
      setBusy(false);
    }
  };

  const ask = async () => {
    if (!comparison || !question.trim()) return;
    const currentQuestion = question.trim();
    setBusy(true);
    setError('');
    try {
      const answer = await documentService.askComparison(
        comparison.document_ids,
        currentQuestion,
        messages,
      );
      setMessages((current): DocumentChatMessage[] => [
        ...current,
        { role: 'user' as const, content: currentQuestion },
        { role: 'assistant' as const, content: answer },
      ].slice(-8));
      setQuestion('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Comparison question failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#101512] p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#F5F7F3]">Compare two research PDFs</h3>
          <p className="mt-1 text-xs text-[#A5ADA7]">Upload two papers for an evidence-grounded comparison and follow-up chat.</p>
        </div>
        <button
          type="button"
          onClick={clearWorkspace}
          disabled={busy || (!documents.some(Boolean) && !comparison && messages.length === 0 && !question && !error)}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1.5 text-xs text-[#A5ADA7] transition-colors hover:border-red-500/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[0, 1].map((index) => (
          <label 
            key={index} 
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition-colors ${
              documents[index] 
                ? 'border-[#6F9B83]/40 bg-[#16231D]' 
                : 'border-white/[0.1] bg-[#0C100E] hover:border-white/[0.2]'
            }`}
          >
            {documents[index] ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6F9B83]" /> : <Upload className="h-5 w-5 shrink-0 text-[#6F9B83]" />}
            <span className="min-w-0 truncate text-xs font-semibold text-[#F5F7F3]">
              {documents[index] ? `Uploaded: ${documents[index]!.title || documents[index]!.filename}` : `Choose PDF ${index + 1}`}
            </span>
            {documents[index] && <span className="ml-auto shrink-0 text-[11px] font-mono text-[#6F9B83]">Click to replace</span>}
            <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file, index);
              event.target.value = '';
            }} />
          </label>
        ))}
      </div>

      {uploadProgress !== null && (
        <div className="space-y-1" role="status" aria-live="polite">
          <div className="flex justify-between text-xs text-[#A5ADA7]">
            <span>
              {uploadProgress.percentage >= 100 ? 'Upload complete; processing PDF...' : 'Uploading PDF...'}
            </span>
            <span>
              {(uploadProgress.loaded / 1024 / 1024).toFixed(1)} / {(uploadProgress.total / 1024 / 1024).toFixed(1)} MB · {uploadProgress.percentage}%
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[#0C100E]"
            role="progressbar"
            aria-label="PDF upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress.percentage}
          >
            <div className="h-full rounded-full bg-[#315C4B] transition-[width] duration-300" style={{ width: `${uploadProgress.percentage}%` }} />
          </div>
        </div>
      )}

      {documents[0] && documents[1] && (
        <button 
          type="button" 
          onClick={() => void compare()} 
          disabled={busy} 
          className="inline-flex items-center gap-2 rounded-lg bg-[#315C4B] px-4 py-2 text-xs font-semibold text-[#F5F7F3] transition hover:bg-[#3D705C] disabled:opacity-50"
        >
          {busy && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
          {busy ? 'Analyzing PDFs...' : 'Compare Uploaded PDFs'}
        </button>
      )}

      {error && <p className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300">{error}</p>}
      {comparison && <ComparisonResult result={comparison} messages={messages} question={question} setQuestion={setQuestion} ask={ask} busy={busy} />}
    </div>
  );
}

function ComparisonResult({ result, messages, question, setQuestion, ask, busy }: {
  result: DocumentComparisonResult;
  messages: DocumentChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  ask: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="rounded-xl border border-[#6F9B83]/30 bg-[#16231D] p-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[#6F9B83]">AI Comparison Summary</h4>
        <p className="mt-2 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#F5F7F3]">{result.comparison.overview}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ['Similarities', result.comparison.similarities],
          ['Differences', result.comparison.differences],
          ['Research Gaps', result.comparison.research_gaps],
        ].map(([title, items]) => (
          <div key={title as string} className="rounded-xl border border-white/[0.08] bg-[#0C100E] p-4">
            <h4 className="font-bold text-xs text-[#6F9B83]">{title as string}</h4>
            <ul className="mt-2 space-y-1.5 pl-2 text-xs text-[#A5ADA7]">
              {(items as string[]).map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="text-[#6F9B83]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0C100E]">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-[#6F9B83] font-mono">
              <th className="p-3">Metric</th>
              {result.documents.map((document) => <th key={document.document_id} className="p-3">{document.title || document.filename}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-[#F5F7F3]">
            {result.comparison.comparison_table.map((row) => (
              <tr key={row.metric}>
                <td className="p-3 font-mono text-[#A5ADA7] bg-[#101512]">{row.metric}</td>
                {['Paper 1', 'Paper 2'].map((paper) => <td key={paper} className="p-3">{row.values?.[paper] || 'Not specified'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocumentChatInterface
        title="Explore the comparison"
        description="Ask follow-up questions across both papers"
        emptyTitle="Dig deeper into the differences"
        emptyDescription="Ask about methods, findings, trade-offs, or how the papers relate to each other."
        placeholder="Ask about the methods, findings, or gaps…"
        activityLabel="Comparing the papers…"
        messages={messages}
        question={question}
        setQuestion={setQuestion}
        onSubmit={ask}
        busy={busy}
      />
    </div>
  );
}
