import { useState } from 'react';
import { CheckCircle2, FileText, Trash2, Upload } from 'lucide-react';
import type { DocumentMetadata, DocumentUploadResult } from '../types/research';
import { documentService, type DocumentChatMessage, type DocumentUploadProgress } from '../services/documentService';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { DocumentChatInterface } from '../components/DocumentChatInterface';

export function DocumentChatView() {
  const [document, setDocument] = useLocalStorageState<DocumentUploadResult | null>('document-chat-document-v1', null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useLocalStorageState<DocumentChatMessage[]>('document-chat-messages-v1', []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
    setError('');
    try {
      setDocument(await documentService.upload(file, setUploadProgress));
      setMessages([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'PDF upload failed.');
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const clearWorkspace = () => {
    setDocument(null);
    setMessages([]);
    setQuestion('');
    setError('');
  };

  const ask = async () => {
    if (!document || !question.trim()) return;
    setBusy(true);
    setError('');
    try {
      const currentQuestion = question.trim();
      const answer = await documentService.ask(
        document.metadata.document_id,
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
      setError(caught instanceof Error ? caught.message : 'Question failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Ask a research paper</h2>
            <p className="mt-1 text-sm text-[#6B6B67]">Upload a paper to explore its summary and ask evidence-based questions.</p>
          </div>
          <button
            type="button"
            onClick={clearWorkspace}
            disabled={busy || (!document && messages.length === 0 && !question && !error)}
            className="flex items-center gap-2 rounded-lg border border-[#D9D7D0] px-3 py-2 text-xs font-semibold text-[#6B6B67] transition-colors hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>
      <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[#9CB8F5] bg-gradient-to-r from-[#EEF4FF] to-white p-4 transition hover:border-[#1D4ED8] hover:shadow-sm sm:p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1D4ED8] shadow-sm">
          {document ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Upload className="h-6 w-6" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[#242424]">
            {busy ? 'Uploading and processing PDF…' : document ? `Replace ${document.metadata.title || document.metadata.filename}` : 'Choose a PDF paper'}
          </span>
          <span className="mt-1 block text-xs text-[#6B6B67]">Selectable-text PDF · Maximum 50 MB · OCR is not configured</span>
        </span>
        <span className="hidden shrink-0 rounded-lg border border-[#D9D7D0] bg-white px-3 py-2 text-xs font-semibold text-[#484842] transition group-hover:border-[#1D4ED8]/40 sm:block">
          Browse files
        </span>
        <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = '';
        }} />
      </label>
      {uploadProgress !== null && (
        <div className="space-y-1" role="status" aria-live="polite">
          <div className="flex justify-between text-xs text-[#6B6B67]">
            <span>
              {uploadProgress.percentage >= 100 ? 'Upload complete; processing PDF...' : 'Uploading PDF...'}
            </span>
            <span>
              {(uploadProgress.loaded / 1024 / 1024).toFixed(1)} / {(uploadProgress.total / 1024 / 1024).toFixed(1)} MB · {uploadProgress.percentage}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[#D9D7D0]"
            role="progressbar"
            aria-label="PDF upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress.percentage}
          >
            <div className="h-full rounded-full bg-[#1D4ED8] transition-[width] duration-300" style={{ width: `${uploadProgress.percentage}%` }} />
          </div>
        </div>
      )}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {document && <DocumentPanel metadata={document.metadata} summary={document.summary} messages={messages} question={question} setQuestion={setQuestion} ask={ask} busy={busy} />}
    </div>
  );
}

function DocumentPanel({ metadata, summary, messages, question, setQuestion, ask, busy }: {
  metadata: DocumentMetadata;
  summary: Record<string, unknown>;
  messages: DocumentChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  ask: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-[#D9D7D0] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#E9E7E1] px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#202020]">{metadata.title || metadata.filename}</h3>
            <p className="mt-0.5 text-xs text-[#777770]">{metadata.page_count} pages · Ready to discuss</p>
          </div>
        </div>
        <div className="px-5 py-4 sm:px-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777770]">Paper summary</p>
          <p className="text-sm leading-7 text-[#373733]">
            {String(summary.executive_summary || summary.one_sentence_summary || 'Summary unavailable.')}
          </p>
        </div>
      </section>
      <DocumentChatInterface
        title="Chat with this paper"
        description="Ask follow-up questions about the document"
        emptyTitle="What would you like to understand?"
        emptyDescription="Ask about the paper’s methods, findings, limitations, or any detail you want to explore."
        placeholder="Ask a question about this paper…"
        activityLabel="Reading the paper…"
        messages={messages}
        question={question}
        setQuestion={setQuestion}
        onSubmit={ask}
        busy={busy}
      />
    </div>
  );
}
