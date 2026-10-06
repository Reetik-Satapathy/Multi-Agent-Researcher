import { useState } from 'react';
import { 
  CheckCircle2, 
  Trash2, 
  Upload, 
  ArrowRight, 
  Bot, 
  UserRound, 
  LoaderCircle,
  HelpCircle
} from 'lucide-react';
import type { DocumentUploadResult } from '../types/research';
import { documentService, type DocumentChatMessage, type DocumentUploadProgress } from '../services/documentService';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { MarkdownContent } from '../components/MarkdownContent';

const SUGGESTED_QUESTIONS = [
  'Summarize this paper',
  'What are the key findings?',
  'What methodology was used?',
  'What are the limitations?',
];

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

  const askQuestionText = async (textToAsk: string) => {
    const trimmed = textToAsk.trim();
    if (!document || !trimmed || busy) return;

    setBusy(true);
    setError('');
    try {
      const answer = await documentService.ask(
        document.metadata.document_id,
        trimmed,
        messages,
      );
      setMessages((current): DocumentChatMessage[] => [
        ...current,
        { role: 'user' as const, content: trimmed },
        { role: 'assistant' as const, content: answer },
      ].slice(-10));
      setQuestion('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Question failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F7F3]">Ask PDF</h2>
          <p className="mt-1 text-xs text-[#A5ADA7]">
            Upload a research paper and ask questions about its contents.
          </p>
        </div>

        {document && (
          <button
            type="button"
            onClick={clearWorkspace}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1.5 text-xs text-[#A5ADA7] transition-colors hover:border-red-500/30 hover:text-red-400 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove PDF</span>
          </button>
        )}
      </div>

      {/* PDF UPLOAD SECTION */}
      <div className="space-y-3">
        <label className={`group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-5 transition-colors ${
          document ? 'border-[#6F9B83]/40 bg-[#16231D]' : 'border-white/[0.12] bg-[#101512] hover:border-white/[0.22]'
        }`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0C100E] text-[#6F9B83]">
            {document ? <CheckCircle2 className="h-5 w-5 text-[#6F9B83]" /> : <Upload className="h-5 w-5 text-[#6F9B83]" />}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-[#F5F7F3]">
              {busy
                ? 'Uploading and processing PDF…'
                : document
                ? `${document.metadata.title || document.metadata.filename}`
                : 'Upload PDF or drag & drop'}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#A5ADA7]">
              {document 
                ? `${document.metadata.page_count} pages · Selectable text PDF`
                : 'Selectable-text PDF · Maximum 50 MB'}
            </span>
          </span>

          {document ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-[#6F9B83]/30 bg-[#16231D] px-2.5 py-1 text-[11px] font-mono text-[#6F9B83]">
                ✓ PDF ready
              </span>
              <span className="hidden text-[11px] text-[#A5ADA7] underline sm:inline">Replace</span>
            </div>
          ) : (
            <span className="hidden rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-1.5 text-xs font-medium text-[#A5ADA7] transition group-hover:border-[#6F9B83]/40 group-hover:text-[#F5F7F3] sm:block">
              Upload PDF
            </span>
          )}

          <input 
            type="file" 
            accept="application/pdf,.pdf" 
            className="hidden" 
            disabled={busy} 
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }} 
          />
        </label>

        {uploadProgress !== null && (
          <div className="space-y-1" role="status">
            <div className="flex justify-between text-xs text-[#A5ADA7]">
              <span>{uploadProgress.percentage >= 100 ? 'Processing PDF content...' : 'Uploading PDF...'}</span>
              <span>{uploadProgress.percentage}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#0C100E]">
              <div className="h-full rounded-full bg-[#315C4B] transition-[width] duration-300" style={{ width: `${uploadProgress.percentage}%` }} />
            </div>
          </div>
        )}

        {error && <p className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300">{error}</p>}
      </div>

      {/* QUESTION & CHAT AREA (When PDF is ready) */}
      {document && (
        <div className="space-y-6 pt-2">
          {/* Question Input Section */}
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#101512] p-5">
            <label className="block text-xs font-semibold text-[#F5F7F3]">
              What would you like to know?
            </label>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void askQuestionText(question);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this PDF..."
                disabled={busy}
                className="w-full rounded-lg border border-white/[0.08] bg-[#0C100E] px-4 py-2.5 text-xs text-[#F5F7F3] placeholder-[#737B76] outline-none focus:border-[#6F9B83]"
              />
              <button
                type="submit"
                disabled={busy || !question.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#315C4B] px-4 py-2.5 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Ask</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Suggested Question Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-[#737B76]">Suggested:</span>
              {SUGGESTED_QUESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => void askQuestionText(sug)}
                  disabled={busy}
                  className="rounded-md border border-white/[0.06] bg-[#0C100E] px-2.5 py-1 text-[11px] text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:text-[#F5F7F3] disabled:opacity-40"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Area */}
          <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#101512] p-5">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 text-xs font-bold text-[#F5F7F3]">
              <HelpCircle className="h-4 w-4 text-[#6F9B83]" />
              <span>Conversation</span>
            </div>

            {messages.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#737B76]">
                Ask any question above or click a suggested prompt to start exploring this document.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs leading-relaxed ${
                        isUser ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                        isUser ? 'bg-[#16231D] text-[#6F9B83] border border-[#6F9B83]/30' : 'bg-[#315C4B] text-[#F5F7F3]'
                      }`}>
                        {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </span>

                      <div className={`max-w-[85%] rounded-lg p-3.5 ${
                        isUser
                          ? 'bg-[#315C4B] text-[#F5F7F3]'
                          : 'border border-white/[0.08] bg-[#0C100E] text-[#F5F7F3]'
                      }`}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <MarkdownContent content={msg.content} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {busy && (
                  <div className="flex items-center gap-2 text-xs text-[#6F9B83]">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing document excerpts...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
