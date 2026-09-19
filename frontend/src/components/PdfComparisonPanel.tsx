import { useState } from 'react';
import { CheckCircle2, Send, Upload } from 'lucide-react';
import type { DocumentMetadata } from '../types/research';
import { documentService, type DocumentChatMessage, type DocumentComparisonResult } from '../services/documentService';

export function PdfComparisonPanel() {
  const [documents, setDocuments] = useState<Array<DocumentMetadata | null>>([null, null]);
  const [comparison, setComparison] = useState<DocumentComparisonResult | null>(null);
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const upload = async (file: File, slot: number) => {
    setBusy(true);
    setUploadProgress(0);
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
      setUploadProgress(100);
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
    <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[#1D4ED8]/30">
      <div>
        <h3 className="text-base font-bold">Compare two research PDFs</h3>
        <p className="mt-1 text-xs text-[#6B6B67]">Upload exactly two papers for an evidence-grounded comparison and follow-up chat.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[0, 1].map((index) => (
          <label key={index} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 ${documents[index] ? 'border-emerald-500/60 bg-emerald-50' : 'border-[#1D4ED8]/30 bg-white'}`}>
            {documents[index] ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <Upload className="h-5 w-5 shrink-0 text-[#1D4ED8]" />}
            <span className="min-w-0 truncate text-xs font-semibold">
              {documents[index] ? `Uploaded: ${documents[index]!.title || documents[index]!.filename}` : `Choose PDF ${index + 1}`}
            </span>
            {documents[index] && <span className="ml-auto shrink-0 text-[11px] font-medium text-emerald-700">Click to replace</span>}
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
          <div className="flex justify-between text-xs text-[#6B6B67]">
            <span>Uploading and processing PDF...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#D9D7D0]">
            <div className="h-full rounded-full bg-[#1D4ED8] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}
      {documents[0] && documents[1] && (
        <button type="button" onClick={() => void compare()} disabled={busy} className="rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {busy ? 'Analyzing PDFs...' : 'Compare Uploaded PDFs'}
        </button>
      )}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
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
    <div className="space-y-4">
      <div className="rounded-xl bg-[#DBEAFE]/60 p-4">
        <h4 className="font-bold">AI comparison</h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{result.comparison.overview}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          ['Similarities', result.comparison.similarities],
          ['Differences', result.comparison.differences],
          ['Research gaps', result.comparison.research_gaps],
        ].map(([title, items]) => (
          <div key={title as string} className="rounded-xl border border-[#D9D7D0] p-4">
            <h4 className="font-bold">{title as string}</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#D9D7D0]">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead><tr className="border-b border-[#D9D7D0]"><th className="p-3">Metric</th>{result.documents.map((document) => <th key={document.document_id} className="p-3">{document.title || document.filename}</th>)}</tr></thead>
          <tbody>{result.comparison.comparison_table.map((row) => <tr key={row.metric} className="border-b border-[#D9D7D0]"><td className="p-3 font-semibold">{row.metric}</td>{['Paper 1', 'Paper 2'].map((paper) => <td key={paper} className="p-3">{row.values?.[paper] || 'Not specified'}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="rounded-xl border border-[#D9D7D0] p-4">
        <h4 className="font-bold">Ask about both papers</h4>
        <div className="mt-3 flex gap-2">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void ask(); }} placeholder="Compare the methods or findings..." className="min-w-0 flex-1 rounded-xl border border-[#D9D7D0] px-4 py-2.5 text-sm" />
          <button type="button" onClick={() => void ask()} disabled={busy || !question.trim()} className="rounded-xl bg-[#1D4ED8] px-4 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </div>
        {messages.length > 0 && <div className="mt-4 space-y-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-xl p-3 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'border border-[#D9D7D0]' : 'bg-[#DBEAFE]/60'}`}>{message.content}</div>)}</div>}
      </div>
    </div>
  );
}
