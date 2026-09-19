import { useState } from 'react';
import { FileText, Send, Upload } from 'lucide-react';
import type { DocumentMetadata, DocumentUploadResult } from '../types/research';
import { documentService } from '../services/documentService';

export function DocumentChatView() {
  const [document, setDocument] = useState<DocumentUploadResult | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      setDocument(await documentService.upload(file));
      setAnswer('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'PDF upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const ask = async () => {
    if (!document || !question.trim()) return;
    setBusy(true);
    setError('');
    try {
      setAnswer(await documentService.ask(document.metadata.document_id, question.trim()));
      setQuestion('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Question failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Ask a research paper</h2>
        <p className="mt-1 text-xs text-[#6B6B67]">Upload a selectable-text PDF to extract, summarize, and question it.</p>
      </div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#1D4ED8]/40 bg-white p-10 text-center">
        <Upload className="h-6 w-6 text-[#1D4ED8]" />
        <span className="text-sm font-semibold">{busy ? 'Processing PDF...' : 'Choose a PDF paper'}</span>
        <span className="text-xs text-[#6B6B67]">Maximum 50 MB; OCR is not configured</span>
        <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }} />
      </label>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {document && <DocumentPanel metadata={document.metadata} summary={document.summary} answer={answer} question={question} setQuestion={setQuestion} ask={ask} busy={busy} />}
    </div>
  );
}

function DocumentPanel({ metadata, summary, answer, question, setQuestion, ask, busy }: {
  metadata: DocumentMetadata;
  summary: Record<string, unknown>;
  answer: string;
  question: string;
  setQuestion: (value: string) => void;
  ask: () => void;
  busy: boolean;
}) {
  return <div className="space-y-4">
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-[#1D4ED8]" /><div><h3 className="font-bold">{metadata.title || metadata.filename}</h3><p className="text-xs text-[#6B6B67]">{metadata.page_count} pages</p></div></div>
      <p className="mt-4 text-sm leading-relaxed">{String(summary.executive_summary || summary.one_sentence_summary || 'Summary unavailable.')}</p>
    </div>
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex gap-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void ask(); }} placeholder="Ask a question about the paper..." className="min-w-0 flex-1 rounded-xl border border-[#D9D7D0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D4ED8]" />
        <button type="button" onClick={() => void ask()} disabled={busy || !question.trim()} className="rounded-xl bg-[#1D4ED8] px-4 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
      </div>
      {answer && <div className="mt-4 rounded-xl bg-[#DBEAFE]/60 p-4 text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>}
    </div>
  </div>;
}
